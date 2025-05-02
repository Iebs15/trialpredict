"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function RadarChart({ data = [] }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // 1. Compute the union of all disease names
    const allDiseases = Array.from(
      new Set(data.flatMap(group => group.data.map(d => d.name)))
    )

    // 2. Prepare datasets
    const datasets = data.map((group, i) => {
      const diseaseMap = Object.fromEntries(
        group.data.map(d => [d.name, d.percentage])
      )

      return {
        label: group.label,
        data: allDiseases.map(name => diseaseMap[name] ?? 0),
        borderColor: `hsl(${(i * 90) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(i * 90) % 360}, 70%, 50%, 0.2)`,
        fill: true,
        pointRadius: 4,
        tension: 0.3,
      }
    })

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: allDiseases,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Disease Distribution by Modality & Region",
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: {
              callback: val => `${val}%`
            },
            pointLabels: {
              font: {
                size: 12
              }
            }
          },
        },
      },
    })

    return () => chartInstance.current?.destroy()
  }, [data])

  return <canvas ref={chartRef} className="w-full h-[400px]" />
}
