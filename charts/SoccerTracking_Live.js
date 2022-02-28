import { useState, useEffect } from "react";

import Plot from "react-plotly.js";

const tradeMetadata = [
  {
    key: "home",
    color: "green",
  },
  {
    key: "away",
    color: "yellow",
  },
  {
    key: "ball",
    color: "red",
  },
];

function getChartData(data) {
  let traces = [];
  let frames = [];

  data.forEach((frame) => {
    const tracesForFrame = tradeMetadata.map((metadata) => {
      const keys = Object.keys(frame).filter((key) =>
        key.includes(metadata.key)
      );

      const xCoordinates = keys
        .filter((key) => key.includes("_x"))
        .filter((key) => frame[key])
        .map((key) => frame[key]);

      const yCoordinates = keys
        .filter((key) => key.includes("_y"))
        .filter((key) => frame[key])
        .map((key) => frame[key]);

      return {
        x: xCoordinates,
        y: yCoordinates,
        type: "fill",
        mode: "markers",
        marker: { color: metadata.color },
        name: metadata.key,
      };
    });

    frames.push({
      name: frame.timestamp,
      data: tracesForFrame,
    });
  });

  traces = frames[0].data;

  return {
    traces,
    frames,
  };
}

export default function SoccerTrackingChart() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const startIndex = data ? data[data.length - 1].index : 0;
      fetch(`http://localhost:5000/data?start_index=${startIndex}`)
        .then((res) => res.json())
        .then((liveData) => {
          if (liveData.length == 0) {
            clearInterval(intervalId);
            return;
          }

          if (!data) {
            setData(liveData);
            setChartData(getChartData(liveData));
          } else {
            setData([...data, ...liveData]);

            const liveChartData = getChartData(liveData);

            setChartData({
              ...chartData,
              frames: [...chartData.frames, ...liveChartData.frames],
            });
          }
        });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [data, chartData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!chartData) {
        return;
      }

      if (frame >= chartData.frames.length - 1) {
        return;
      }

      setFrame(frame + 1);
    }, 5);

    return () => clearInterval(intervalId);
  }, [chartData, frame]);

  if (!chartData) return <p>Loading</p>;

  return (
    <Plot
      style={{ position: "relative" }}
      data={chartData.frames[frame].data}
      config={{
        displayModeBar: false,
      }}
      layout={{
        margin: {
          l: 0,
          t: 0,
          r: 0,
          b: 0,
        },
        xaxis: {
          showgrid: false,
          fixedrange: true,
          showticklabels: false,
          showline: false,
          range: [0, 1],
          zeroline: false,
        },
        yaxis: {
          showgrid: false,
          fixedrange: true,
          showticklabels: false,
          showline: false,
          range: [0, 1],
          zeroline: false,
        },
        images: [
          {
            source: "/soccer_field.png",
            xref: "x",
            yref: "y",
            layer: "below",
            sizing: "stretch",
            x: 0,
            y: 1,
            sizex: 1,
            sizey: 1,
          },
        ],
      }}
    />
  );
}
