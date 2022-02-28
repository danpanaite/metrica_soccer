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
  let sliderSteps = [];

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
      };
    });

    tracesForFrame.push({
      x: [0, 0, 1, 1, 0.5],
      y: [0, 1, 0, 1, 0.5],
      type: "fill",
      mode: "markers",
      marker: { color: "grey" },
    });

    frames.push({
      name: frame.timestamp,
      data: tracesForFrame,
    });

    traces = frames[0].data;

    sliderSteps.push({
      method: "animate",
      label: frame.timestamp,
      args: [
        [frame.timestamp],
        {
          mode: "immediate",
          transition: { duration: 0 },
          frame: { duration: 0, redraw: false },
        },
      ],
    });
  });

  return {
    traces,
    frames,
    sliderSteps,
  };
}

export default function SoccerTrackingChart() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const intervalId = setInterval(() => {
      const startIndex = data ? data[data.length - 1].index : 0;
      fetch(`http://localhost:5000/data?start_index=${startIndex}`)
        .then((res) => res.json())
        .then((liveData) => {
          if (!data) {
            setData(liveData);
          } else {
            console.log(data);
            setData([...data, ...liveData]);
          }
          setLoading(false);
        });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [data]);

  // if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;

  const chartData = getChartData(data);

  return (
    <Plot
      style={{ position: "relative" }}
      data={chartData.traces}
      frames={chartData.frames}
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
        updatemenus: [
          {
            x: 0,
            y: 0,
            yanchor: "top",
            xanchor: "left",
            showactive: false,
            direction: "left",
            type: "buttons",
            pad: { t: 87, r: 10 },
            buttons: [
              {
                method: "animate",
                args: [
                  null,
                  {
                    mode: "immediate",
                    fromcurrent: true,
                    transition: { duration: 40 },
                    frame: { duration: 40, redraw: false },
                  },
                ],
                label: "Play",
              },
              {
                method: "animate",
                args: [
                  [null],
                  {
                    mode: "immediate",
                    transition: { duration: 0 },
                    frame: { duration: 0, redraw: false },
                  },
                ],
                label: "Pause",
              },
            ],
          },
        ],
        // Finally, add the slider and use `pad` to position it
        // nicely next to the buttons.
        sliders: [
          {
            pad: { l: 130, t: 55 },
            currentvalue: {
              visible: true,
              prefix: "Timestamp:",
              xanchor: "right",
              font: { size: 20, color: "#666" },
            },
            steps: chartData.sliderSteps,
          },
        ],
      }}
    />
  );
}
