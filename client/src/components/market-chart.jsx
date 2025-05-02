import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export const MarketChart = forwardRef(({ data = [] }, ref) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Expose the canvas for download
  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      const canvas = chartRef.current
      const link = document.createElement("a")
      link.download = "market-analysis-chart.png"
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()
    }
  }))

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const allYears = data[0]?.data.map(d => d.year) || []
    const datasets = data.map((group, i) => ({
      label: group.label,
      data: group.data.map(d => (d.revenue / 1_000_000).toFixed(2)),
      borderColor: `hsl(${i * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${i * 60}, 70%, 50%, 0.2)`,
      tension: 0.3,
      fill: false,
    }))

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: allYears,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Revenue (in Millions USD)" },
            ticks: {
              callback: value => value + " M"
            }
          },
          x: {
            title: { display: true, text: "Year" }
          }
        }
      }
    })

    return () => chartInstance.current?.destroy()
  }, [data])

  return <canvas ref={chartRef} className="w-full h-full" />
})
