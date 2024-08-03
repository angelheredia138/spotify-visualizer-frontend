import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { Box, Select } from "@chakra-ui/react";
import "../css/Components.css";

const ScatterPlot = ({ tracks, timeRange, setTimeRange }) => {
  const [processedTracks, setProcessedTracks] = useState([]);
  let isHovering = false;
  let hoverTimeout = null;
  let clickTimeout = null;

  useEffect(() => {
    if (tracks.length > 0) {
      preprocessTracks(tracks);
    }
  }, [tracks]);

  const preprocessTracks = (tracks) => {
    const processed = tracks
      .filter((track) => track.audio_features)
      .map((track) => ({
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "), // Get artist names
        danceability: track.audio_features.danceability || 0,
        energy: track.audio_features.energy || 0,
        tempo: track.audio_features.tempo || 0,
        valence: track.audio_features.valence || 0,
      }));

    setProcessedTracks(processed);
  };

  const drawScatterPlot = () => {
    const svg = d3
      .select("#d3-scatter-plot")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${1200} ${900}`) // Increase the size of the chart
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    svg.selectAll("*").remove(); // Clear the chart before drawing

    const margin = { top: 60, right: 60, bottom: 120, left: 100 };
    const width = 1200 - margin.left - margin.right; // Increase the width
    const height = 900 - margin.top - margin.bottom; // Increase the height

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedTracks, (d) => d.energy)])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedTracks, (d) => d.danceability)])
      .nice()
      .range([height, 0]);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip for tracks
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
      .style("display", "none")
      .style("font-size", "18px");

    chart
      .append("g")
      .selectAll("circle")
      .data(processedTracks)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.energy))
      .attr("cy", (d) => y(d.danceability))
      .attr("r", 10)
      .style("fill", "steelblue")
      .on("mouseover", function (event, d) {
        isHovering = true;
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.name}</strong><br/>Artist: ${
              d.artist
            }<br/>Danceability: ${d.danceability.toFixed(
              2
            )}<br/>Energy: ${d.energy.toFixed(2)}<br/>Tempo: ${
              d.tempo
            }<br/>Valence: ${d.valence.toFixed(2)}`
          );
        d3.select(this).style("fill", "darkblue");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        isHovering = false;
        tooltip.style("display", "none");
        d3.select(this).style("fill", function () {
          return d3.select(this).classed("highlighted")
            ? "darkblue"
            : "steelblue";
        });
      })
      .on("click", function (event, d) {
        if (isHovering) return;

        const circle = d3.select(this);
        const isHighlighted = circle.classed("highlighted");

        // Remove highlight from all circles within the scatter plot
        chart
          .selectAll("circle")
          .classed("highlighted", false)
          .style("fill", "steelblue");

        if (!isHighlighted) {
          tooltip
            .style("display", "block")
            .html(
              `<strong>${d.name}</strong><br/>Artist: ${
                d.artist
              }<br/>Danceability: ${d.danceability.toFixed(
                2
              )}<br/>Energy: ${d.energy.toFixed(2)}<br/>Tempo: ${
                d.tempo
              }<br/>Valence: ${d.valence.toFixed(2)}`
            );
          circle.classed("highlighted", true).style("fill", "darkblue");
        } else {
          tooltip.style("display", "none");
          circle.classed("highlighted", false).style("fill", "steelblue");
        }

        clearTimeout(clickTimeout); // Clear any existing timeout
        clickTimeout = setTimeout(() => {
          tooltip.style("display", "none");
          circle.classed("highlighted", false).style("fill", "steelblue");
        }, 5000); // Hide the tooltip after 5 seconds
      });

    const xAxis = chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10)) // Increase the number of ticks
      .selectAll("text")
      .style("font-size", "30px") // Increase the font size of the axis labels
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold");

    chart
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 40) // Adjust y position of x-axis label
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .style("font-size", "30px") // Increase the font size of the axis title
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold")
      .text("Energy");

    const yAxis = chart
      .append("g")
      .call(d3.axisLeft(y).ticks(10)) // Increase the number of ticks
      .selectAll("text")
      .style("font-size", "30px") // Increase the font size of the axis labels
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold");

    chart
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 30) // Adjust y position of y-axis label
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .style("font-size", "30px") // Increase the font size of the axis title
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold")
      .text("Danceability");
  };

  useEffect(() => {
    drawScatterPlot();
  }, [processedTracks]);

  return (
    <Box
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px" }}
    >
      <svg id="d3-scatter-plot" style={{ width: "100%", height: "100%" }}></svg>
      <Box className="time-range-controls">
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="dropdown"
          mb={4} // Add some margin-bottom for spacing
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </Select>
      </Box>
    </Box>
  );
};

export default ScatterPlot;
