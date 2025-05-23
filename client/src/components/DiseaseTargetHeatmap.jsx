import { useState } from "react";

export default function DiseaseTargetHeatmap({ diseaseID, diseaseName, data }) {
  const diseaseData = {
    diseaseID,
    diseaseName,
    data
  };

  console.log("HeatMap: ", diseaseData);


  // Extract all unique datasources from all targets
  const allDatasources = new Set();
  data.targets.forEach(target => {
    if (target.datasourceScores) {
      Object.keys(target.datasourceScores).forEach(source => {
        allDatasources.add(source);
      });
    }
  });

  const datasourceArray = Array.from(allDatasources);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Color intensity calculation based on score - using green shades
  const getColorIntensity = (score) => {
    if (!score) return "bg-white";

    if (score >= 0.8) return "bg-green-800";
    if (score >= 0.6) return "bg-green-700";
    if (score >= 0.4) return "bg-green-600";
    if (score >= 0.2) return "bg-green-500";
    if (score >= 0.1) return "bg-green-400";
    return "bg-green-300";
  };

  const getScoreTooltip = (score) => {
    if (!score) return null;
    return (
      <div className="absolute z-10 -translate-x-1/2 -translate-y-full left-1/2 top-0 bg-white p-2 rounded shadow-md text-xs border border-gray-300">
        Score: {score.toFixed(2)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">

      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="text-left p-3 w-28 border-b-2 border-gray-200">Target</th>
              <th className="text-center p-3 w-32 border-b-2 border-gray-200">
                Association<br />Score
              </th>
              {datasourceArray.map((source) => (
                <th key={source} className="p-3 w-20 border-b-2 border-gray-200">
                  <div className="h-36 relative">
                    <span className="absolute origin-bottom-left rotate-60 translate-y-10 -translate-x-2 whitespace-nowrap font-medium text-xs">
                      {source}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.targets.map((target, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                <td className="p-3 font-medium border-b border-gray-200">{target.approvedSymbol}</td>
                <td className="p-3 border-b border-gray-200">
                  <div className={`w-full h-6 ${getColorIntensity(target.score)}`}></div>
                </td>

                {/* Datasource cells */}
                {datasourceArray.map((source) => {
                  const score = target.datasourceScores && target.datasourceScores[source];
                  const hasScore = score !== undefined;
                  const cellId = `${target.approvedSymbol}-${source}`;

                  return (
                    <td key={`${index}-${source}`} className="p-3 text-center align-middle border-b border-gray-200">
                      <div className="flex justify-center items-center">
                        <div
                          className={`w-6 h-6 ${hasScore ? getColorIntensity(score) : 'border border-gray-300 bg-white'} relative cursor-pointer`}
                          onMouseEnter={() => hasScore && setHoveredCell({ id: cellId, score })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {hoveredCell && hoveredCell.id === cellId && getScoreTooltip(score)}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center">
        <div className="mr-8">
          <div className="text-sm font-bold mb-1">Association score</div>
          <div className="flex h-4">
            <div className="w-8 bg-green-300"></div>
            <div className="w-8 bg-green-400"></div>
            <div className="w-8 bg-green-500"></div>
            <div className="w-8 bg-green-600"></div>
            <div className="w-8 bg-green-700"></div>
            <div className="w-8 bg-green-800"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>0.1</span>
            <span>0.3</span>
            <span>0.5</span>
            <span>0.7</span>
            <span>0.9</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-6 h-6 border border-gray-300 mr-2"></div>
          <span className="text-sm">No data</span>
        </div>
      </div>
    </div>
  );
}