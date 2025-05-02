"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import html2canvas from "html2canvas"
import { Chart, registerables } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

Chart.register(...registerables, ChartDataLabels)

export const PieGrid = forwardRef(function PieGrid({ data = [], idPrefix = "pie-grid" }, ref) {
  const chartRefs = useRef([])
  const gridContainerRef = useRef(null)

  // ✅ Process data with "Others" if total < 100
  const processedData = data.map(group => {
    const total = group.data.reduce((sum, d) => sum + d.percentage, 0)
    const newData = [...group.data]
    if (total < 100) {
      newData.push({
        name: "Others",
        percentage: +(100 - total).toFixed(2)
      })
    }
    return {
      ...group,
      data: newData
    }
  })

  // ✅ Sanitize unsupported oklch() color usage before html2canvas
  const sanitizeOklchColors = (element) => {
    const all = element.querySelectorAll("*")
    all.forEach(el => {
      const styles = window.getComputedStyle(el)
      if (styles.backgroundColor.includes("oklch")) {
        el.style.backgroundColor = "#ffffff"
      }
      if (styles.color.includes("oklch")) {
        el.style.color = "#000000"
      }
    })
  }

  // ✅ Expose a single-image download method
  useImperativeHandle(ref, () => ({
    downloadChartsAsImage: async () => {
      if (!gridContainerRef.current) return
      sanitizeOklchColors(gridContainerRef.current)

      const canvas = await html2canvas(gridContainerRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true
      })

      const link = document.createElement("a")
      link.download = `${idPrefix}-charts.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }))

  useEffect(() => {
    chartRefs.current.forEach(chart => chart?.destroy?.())
    chartRefs.current = []

    processedData.forEach((group, i) => {
      const canvasId = `${idPrefix}-chart-${i}`
      const canvas = document.getElementById(canvasId)
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      const labels = group.data.map(d => d.name)
      const values = group.data.map(d => d.percentage)

      const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: labels.map(
              (_, idx) => `hsl(${(idx * 80) % 360}, 70%, 60%)`
            ),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom"
            },
            title: {
              display: true,
              text: group.label,
              padding: {
                top: 10,
                bottom: 10
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
              }
            },
            datalabels: {
              color: "#000",
              font: {
                weight: "bold",
                size: 14
              },
              formatter: (value) => `${value}%`
            }
          }
        },
        plugins: [ChartDataLabels]
      })

      chartRefs.current.push(chart)
    })

    return () => chartRefs.current.forEach(chart => chart?.destroy?.())
  }, [processedData, idPrefix])

  // ✅ Layout logic based on number of charts
  const layoutClass =
    data.length === 1
      ? "flex justify-center"
      : data.length === 2
      ? "flex justify-between"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"

  return (
    <div
      ref={gridContainerRef}
      className={`${layoutClass} bg-white p-4 rounded-md`}
      style={{ color: "#000" }}
    >
      {processedData.map((_, i) => (
        <div key={i} className="w-full h-[300px] max-w-[400px] mx-auto">
          <canvas id={`${idPrefix}-chart-${i}`} className="w-full h-full" />
        </div>
      ))}
    </div>
  )
})
