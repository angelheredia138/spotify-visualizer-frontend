import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { Box, Text } from "@chakra-ui/react";
import "../css/Components.css";

const ArtistLeaderboard = ({ artists }) => {
  const [processedArtists, setProcessedArtists] = useState([]);
  let isHovering = false;
  let hoverTimeout = null;
  let clickTimeout = null;

  useEffect(() => {
    if (artists.length > 0) {
      preprocessArtistNames(artists);
    }
  }, [artists]);

  const preprocessArtistNames = (artists) => {
    const truncateLimit = 18;
    const processed = artists.slice(0, 25).map((artist) => {
      if (artist.name.length > truncateLimit && artist.name.includes(" ")) {
        const abbreviation = artist.name
          .split(" ")
          .map((word) => word[0])
          .join("");
        return {
          ...artist,
          displayName: abbreviation + "*",
          fullName: artist.name,
        };
      } else {
        return { ...artist, displayName: artist.name, fullName: artist.name };
      }
    });

    setProcessedArtists(processed);
  };

  const drawLeaderboard = () => {
    const svg = d3
      .select("#d3-leaderboard")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${800} ${650}`)
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    svg.selectAll("*").remove(); // Clear the chart before drawing

    const margin = { top: 20, right: 30, bottom: 150, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedArtists, (d) => d.popularity)])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(processedArtists.map((d) => d.displayName))
      .range([0, height])
      .padding(0.1);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add drop shadow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("result", "offsetBlur");

    const feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Tooltip for artists
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

    chart
      .append("g")
      .selectAll("rect")
      .data(processedArtists)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.displayName))
      .attr("width", (d) => x(d.popularity))
      .attr("height", y.bandwidth())
      .style("fill", "steelblue")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", function (event, d) {
        isHovering = true;
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.fullName}</strong><br/>Popularity: ${
              d.popularity
            }<br/>Genres: ${d.genres.join(", ")}`
          );
        d3.select(this).style("fill", "darkblue");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
        hoverTimeout = setTimeout(() => {
          tooltip.style("display", "none");
        }, 15000); // Hide the tooltip after 15 seconds
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

        const rect = d3.select(this);
        const isHighlighted = rect.classed("highlighted");

        // Remove highlight from all bars
        d3.selectAll("rect")
          .classed("highlighted", false)
          .style("fill", "steelblue");

        if (!isHighlighted) {
          tooltip
            .style("display", "block")
            .html(
              `<strong>${d.fullName}</strong><br/>Popularity: ${
                d.popularity
              }<br/>Genres: ${d.genres.join(", ")}`
            );
          rect.classed("highlighted", true).style("fill", "darkblue");
        } else {
          tooltip.style("display", "none");
          rect.classed("highlighted", false).style("fill", "steelblue");
        }

        clearTimeout(clickTimeout); // Clear any existing timeout
        clickTimeout = setTimeout(() => {
          tooltip.style("display", "none");
          rect.classed("highlighted", false).style("fill", "steelblue");
        }, 5000); // Hide the tooltip after 5 seconds
      });

    const xAxis = chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))) // Ensure solid numbers on x-axis
      .selectAll("text")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold");

    const yAxis = chart
      .append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold")
      .attr("transform", "translate(-10,0) rotate(-45)") // Tilt the text
      .style("text-anchor", "end");

    // Add x-axis label
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold")
      .text("Popularity");

    svg
      .append("foreignObject")
      .attr("x", margin.left)
      .attr("y", height + margin.top + 65)
      .attr("width", width) // Set width to ensure text wrapping
      .attr("height", 100) // Adjust height as needed
      .append("xhtml:div")
      .style("font-size", "20px") // Increase font size
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "normal")
      .style("color", "#333")
      .style("text-align", "center")
      .html(
        "Popularity is a metric provided by Spotify that indicates how popular an artist is based on the number of streams, album sales, and other factors."
      );
  };

  useEffect(() => {
    drawLeaderboard();
  }, [processedArtists]);

  return (
    <Box
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px" }}
    >
      <svg id="d3-leaderboard" style={{ width: "100%", height: "100%" }}></svg>
      {processedArtists.some((artist) => artist.displayName.includes("*")) && (
        <Text mt={4} fontSize="12px" color="gray.600">
          * Full artist names:{" "}
          {processedArtists
            .filter((artist) => artist.displayName.includes("*"))
            .map((artist) => artist.fullName)
            .join(", ")}
        </Text>
      )}
    </Box>
  );
};

export default ArtistLeaderboard;
