import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Text } from "@chakra-ui/react";
import "../css/Components.css";

const PieChart = ({ genres }) => {
  const pieChartRef = useRef(null);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [oneCountGenres, setOneCountGenres] = useState([]);
  const [genreInfo, setGenreInfo] = useState("");
  let hoverTimeout = null;
  let clickTimeout = null;
  let isHovering = false;

  useEffect(() => {
    if (genres.length > 0) {
      setOneCountGenres(genres.filter((d) => d.count === 1));
      drawPieChart(genres);
    }
  }, [genres]);

  const drawPieChart = (genres) => {
    const container = pieChartRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const radius = Math.min(width, height) / 2;

    d3.select(container).selectAll("svg").remove(); // Clear the previous SVG

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "transparent");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.count);

    const arc = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const arcOver = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const otherGenres = genres.filter((d) => d.count > 1);
    const data = [...otherGenres, { genre: "Other", count: 1 }];

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

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

    const path = g
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", (d) => color(d.data.genre))
      .each(function (d) {
        this._current = d;
      })
      .on("mouseover", function (event, d) {
        if (selectedSlice !== d.data.genre) {
          isHovering = true;
          d3.select(this).transition().duration(200).attr("d", arcOver);

          // Increase the font size of the text label on hover
          d3.select(this.parentNode)
            .selectAll("text")
            .filter((textData) => textData.data.genre === d.data.genre)
            .transition()
            .duration(200)
            .style("font-size", "14px")
            .style("opacity", 1); // Make the text fully visible on hover

          clearTimeout(hoverTimeout); // Clear any existing timeout
          hoverTimeout = setTimeout(() => {
            if (selectedSlice !== d.data.genre) {
              d3.select(this.parentNode)
                .selectAll("text")
                .filter((textData) => textData.data.genre === d.data.genre)
                .transition()
                .duration(200)
                .style("font-size", "1px")
                .style("opacity", 0.2); // Revert the text size on timeout
            }
          }, 1000); // Hide the tooltip after 1 second

          // Show tooltip on hover
          tooltip
            .style("display", "block")
            .html(
              d.data.genre === "Other"
                ? "Other genres, see below"
                : `${d.data.genre} - Artists: ${d.data.count}`
            );
        }
      })
      .on("mousemove", function (event, d) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function (event, d) {
        if (selectedSlice !== d.data.genre) {
          isHovering = false;
          d3.select(this).transition().duration(200).attr("d", arc);

          // Reset the font size of the text label on mouse out
          d3.select(this.parentNode)
            .selectAll("text")
            .filter((textData) => textData.data.genre === d.data.genre)
            .transition()
            .duration(200)
            .style("font-size", "1px")
            .style("opacity", 0.2); // Make the text semi-transparent on mouse out

          tooltip.style("display", "none"); // Hide tooltip on mouse out
        }
      })
      .on("click", function (event, d) {
        if (isHovering) return;

        setSelectedSlice(d.data.genre);

        let infoContent;
        if (d.data.genre === "Other") {
          infoContent = "Other genres, see below";
        } else {
          infoContent = `${d.data.genre} - Artists: ${d.data.count}`;
        }

        setGenreInfo(infoContent);

        // Reset font size for all other text labels
        d3.select(this.parentNode)
          .selectAll("text")
          .transition()
          .duration(200)
          .style("font-size", "1px")
          .style("opacity", 0.2); // Make the text semi-transparent

        // Increase the font size of the text label on click
        d3.select(this.parentNode)
          .selectAll("text")
          .filter((textData) => textData.data.genre === d.data.genre)
          .transition()
          .duration(200)
          .style("font-size", "14px")
          .style("opacity", 1); // Make the text fully visible on click

        clearTimeout(clickTimeout); // Clear any existing timeout
        clickTimeout = setTimeout(() => {
          setGenreInfo("");
          d3.select(this.parentNode)
            .selectAll("text")
            .filter((textData) => textData.data.genre === d.data.genre)
            .transition()
            .duration(200)
            .style("font-size", "1px")
            .style("opacity", 0.2); // Revert the text size on timeout
          setSelectedSlice(null);
        }, 1000); // Hide the tooltip after 1 second
      });

    const text = g
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .text((d) => (d.data.genre === "Other" ? "" : d.data.genre))
      .style("font-size", "1px") // Super small font size
      .style("font-family", "Poppins")
      .style("fill", "#000")
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("pointer-events", "none") // Make text non-interactive
      .style("opacity", 0.2) // Make the text semi-transparent
      .each(function (d) {
        this._current = d;
      });
  };

  return (
    <Box
      ref={pieChartRef}
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px", borderRadius: "10px" }}
    >
      <Text fontSize="md" mb={4} textAlign="center">
        {genreInfo}
      </Text>
      <svg id="d3-pie-chart" style={{ width: "100%", height: "100%" }}></svg>
    </Box>
  );
};

export default PieChart;
