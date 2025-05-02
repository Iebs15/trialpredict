"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function GroupedBarChart({ data = [] }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Step 1: Collect union of all disease names
    const allDiseaseNames = Array.from(
      new Set(
        data.flatMap(group => group.data.map(d => d.name))
      )
    )

    // Step 2: Create datasets for each modality-region group
    const datasets = data.map((group, i) => {
      const diseaseMap = Object.fromEntries(
        group.data.map(d => [d.name, d.percentage])
      )

      return {
        label: group.label,
        data: allDiseaseNames.map(name => diseaseMap[name] ?? 0),
        backgroundColor: `hsl(${(i * 60) % 360}, 70%, 50%)`,
      }
    })

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: allDiseaseNames,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Disease Share by Modality & Region"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Percentage (%)"
            }
          },
          x: {
            title: {
              display: true,
              text: "Disease"
            },
            ticks: {
              autoSkip: false,
              maxRotation: 40,
              minRotation: 20
            }
          }
        }
      }
    })

    return () => chartInstance.current?.destroy()
  }, [data])

  return <canvas ref={chartRef} className="w-full h-[400px]" />
}
