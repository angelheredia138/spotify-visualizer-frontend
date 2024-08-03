import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { Box } from "@chakra-ui/react";
import "../css/Components.css";

const RadarChart = ({ tracks }) => {
  const [processedTracks, setProcessedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  let isHovering = false;
  let hoverTimeout = null;
  let clickTimeout = null;

  useEffect(() => {
    if (tracks.length > 0) {
      preprocessTracks(tracks);
    }
  }, [tracks]);

  const preprocessTracks = (tracks) => {
    const topOutliers = findTopOutliers(tracks);
    const balancedTracks = findMostBalancedTracks(tracks);

    const selectedTracks = [...topOutliers, ...balancedTracks].slice(0, 5);

    const maxTempo = d3.max(
      selectedTracks,
      (track) => track.audio_features.tempo
    );

    const processed = selectedTracks
      .filter((track) => track.audio_features)
      .map((track) => ({
        name: track.name,
        artist: track.artists[0].name, // Assuming the first artist is the main one
        danceability: track.audio_features.danceability || 0,
        energy: track.audio_features.energy || 0,
        tempo: (track.audio_features.tempo || 0) / maxTempo, // Normalize tempo
        valence: track.audio_features.valence || 0,
      }));

    setProcessedTracks(processed);
  };

  const findTopOutliers = (tracks) => {
    const topDanceability = tracks
      .sort(
        (a, b) => b.audio_features.danceability - a.audio_features.danceability
      )
      .slice(0, 1);
    const topEnergy = tracks
      .sort((a, b) => b.audio_features.energy - a.audio_features.energy)
      .slice(0, 1);
    const topTempo = tracks
      .sort((a, b) => b.audio_features.tempo - a.audio_features.tempo)
      .slice(0, 1);
    const topValence = tracks
      .sort((a, b) => b.audio_features.valence - a.audio_features.valence)
      .slice(0, 1);

    return [...topDanceability, ...topEnergy, ...topTempo, ...topValence];
  };

  const findMostBalancedTracks = (tracks) => {
    const meanDanceability = d3.mean(
      tracks,
      (track) => track.audio_features.danceability
    );
    const meanEnergy = d3.mean(tracks, (track) => track.audio_features.energy);
    const meanTempo = d3.mean(tracks, (track) => track.audio_features.tempo);
    const meanValence = d3.mean(
      tracks,
      (track) => track.audio_features.valence
    );

    const balancedTracks = tracks
      .map((track) => ({
        ...track,
        balanceScore:
          Math.abs(track.audio_features.danceability - meanDanceability) +
          Math.abs(track.audio_features.energy - meanEnergy) +
          Math.abs(track.audio_features.tempo - meanTempo) +
          Math.abs(track.audio_features.valence - meanValence),
      }))
      .sort((a, b) => a.balanceScore - b.balanceScore)
      .slice(0, 1);

    return balancedTracks;
  };

  const drawRadarChart = () => {
    const svg = d3
      .select("#d3-radar-chart")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${800} ${800}`)
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    svg.selectAll("*").remove(); // Clear the chart before drawing

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 + margin.left},${height / 2 + margin.top})`
      );

    const angleSlice = (2 * Math.PI) / 4;
    const levels = 5;
    const maxValue = 1;

    const radarLine = d3
      .lineRadial()
      .radius((d) => radius * d.value)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const featureNames = ["danceability", "energy", "tempo", "valence"];

    // Create the circular grid
    const axisGrid = chart.append("g").attr("class", "axisWrapper");

    // Draw circular grid
    axisGrid
      .selectAll(".levels")
      .data(d3.range(1, levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", (d) => (radius / levels) * d)
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", 0.1);

    // Draw axis lines
    const axis = axisGrid
      .selectAll(".axis")
      .data(featureNames)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("class", "line")
      .style("stroke", "white")
      .style("stroke-width", "2px");

    // Draw axis labels
    axis
      .append("text")
      .attr("class", "legend")
      .style("font-size", "30px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr(
        "x",
        (d, i) => (radius + 30) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y",
        (d, i) => (radius + 30) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .attr("transform", (d, i) => {
        const x = (radius + 30) * Math.cos(angleSlice * i - Math.PI / 2);
        const y = (radius + 30) * Math.sin(angleSlice * i - Math.PI / 2);
        if (d === "valence") {
          return `rotate(-90 ${x} ${y})`;
        } else if (d === "energy") {
          return `rotate(90 ${x} ${y})`;
        } else {
          return `rotate(0 ${x} ${y})`;
        }
      })
      .text((d) => d);

    // Prepare data
    const radarData = processedTracks.map((track) => {
      return {
        name: track.name,
        artist: track.artist,
        axes: featureNames.map((feature) => {
          return { axis: feature, value: track[feature] };
        }),
      };
    });

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Draw the radar chart blobs
    radarData.forEach((data, i) => {
      const color = d3.schemeCategory10[i % 10];

      const blobWrapper = chart.append("g");

      const path = blobWrapper
        .append("path")
        .datum(data.axes)
        .attr("class", "radarArea")
        .attr("d", radarLine)
        .style("fill", color)
        .style("fill-opacity", 0.1)
        .style("stroke", color)
        .style("stroke-width", "2px")
        .style("stroke-opacity", 0.6)
        .on("mouseover", function (event, d) {
          isHovering = true;
          tooltip.style("display", "block").html(
            `<strong>${data.name} - ${data.artist}</strong><br/>
               Danceability: ${data.axes[0].value.toFixed(2)}<br/>
               Energy: ${data.axes[1].value.toFixed(2)}<br/>
               Tempo: ${(data.axes[2].value * maxValue).toFixed(2)}<br/>
               Valence: ${data.axes[3].value.toFixed(2)}`
          );
          d3.select(this).style("fill-opacity", 0.3);
        })
        .on("mousemove", function (event) {
          clearTimeout(hoverTimeout); // Clear any existing timeout
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");

          hoverTimeout = setTimeout(() => {
            tooltip.style("display", "none");
          }, 15000); // Hide the tooltip after 1 second
        })
        .on("mouseout", function () {
          isHovering = false;
          clearTimeout(hoverTimeout); // Clear the hover timeout
          tooltip.style("display", "none");
          if (!selectedTrack || selectedTrack.name !== data.name) {
            d3.select(this).style("fill-opacity", 0.1);
          }
        })
        .on("click", function (event, d) {
          if (isHovering) return;

          tooltip.style("display", "block").html(
            `<strong>${data.name} - ${data.artist}</strong><br/>
                 Danceability: ${data.axes[0].value.toFixed(2)}<br/>
                 Energy: ${data.axes[1].value.toFixed(2)}<br/>
                 Tempo: ${(data.axes[2].value * maxValue).toFixed(2)}<br/>
                 Valence: ${data.axes[3].value.toFixed(2)}`
          );
          d3.select(this).style("fill-opacity", 0.3); // Apply fill opacity change here

          clearTimeout(clickTimeout); // Clear any existing timeout
          clickTimeout = setTimeout(() => {
            tooltip.style("display", "none");
            d3.select(this).style("fill-opacity", 0.1);
          }, 1000); // Hide the tooltip after 1 second
        });

      blobWrapper
        .selectAll(`.radarCircle-${i}`)
        .data(data.axes)
        .enter()
        .append("circle")
        .attr("class", `radarCircle-${i}`)
        .attr("r", 4)
        .attr(
          "cx",
          (d, i) => radius * d.value * Math.cos(angleSlice * i - Math.PI / 2)
        )
        .attr(
          "cy",
          (d, i) => radius * d.value * Math.sin(angleSlice * i - Math.PI / 2)
        )
        .style("fill", color)
        .style("fill-opacity", 0.8);
    });

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, ${margin.top})`);

    legend
      .selectAll(".legend-item")
      .data(radarData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 50})`)
      .append("rect")
      .attr("x", -600)
      .attr("y", 520)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d, i) => d3.schemeCategory10[i % 10]);

    legend
      .selectAll(".legend-item")
      .append("text")
      .attr("x", -580)
      .attr("y", 530)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "'Poppins', sans-serif")
      .text((d) => `${d.name}`);

    legend
      .selectAll(".legend-item")
      .append("text")
      .attr("x", -580)
      .attr("y", 550)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "'Poppins', sans-serif")
      .text((d) => `${d.artist}`);
  };

  useEffect(() => {
    drawRadarChart();
  }, [processedTracks, selectedTrack]);

  return (
    <Box
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px" }}
    >
      <svg id="d3-radar-chart" style={{ width: "100%", height: "100%" }}></svg>
    </Box>
  );
};

export default RadarChart;
