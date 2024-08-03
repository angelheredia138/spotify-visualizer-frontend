import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { Box } from "@chakra-ui/react";
import "../css/Components.css";

const WordCloud = ({ genres }) => {
  const wordCloudRef = useRef(null);
  let isHovering = false;
  let clickTimeout = null;

  useEffect(() => {
    const handleResize = () => {
      if (genres.length > 0) {
        drawWordCloud(genres);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set dimensions

    return () => window.removeEventListener("resize", handleResize);
  }, [genres]);

  useEffect(() => {
    if (genres.length > 0) {
      drawWordCloud(genres);
    }
  }, [genres]);

  const drawWordCloud = (genres) => {
    const container = wordCloudRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(container).selectAll("svg").remove(); // Clear the previous SVG

    const svg = d3
      .select(container)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 800 600`)
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    const maxCount = d3.max(genres, (d) => d.count);
    const fontSizeScale = d3.scaleSqrt().domain([0, maxCount]).range([10, 40]); // Set a max font size

    const layout = cloud()
      .size([800, 600])
      .words(
        genres.map((d) => ({
          text: d.genre,
          displayText:
            d.genre.length > 15 ? `${d.genre.slice(0, 15)}...` : d.genre, // Truncate for display
          size: fontSizeScale(d.count),
        }))
      )
      .padding(5) // Increase padding to prevent cutoff
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .fontSize((d) => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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

      svg
        .append("g")
        .attr("transform", `translate(400,300)`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", "Poppins")
        .style("fill", (d) => colorScale(d.text))
        .style("font-weight", "bold") // Bold text for better readability
        .style("stroke", "white") // White stroke for better contrast
        .style("stroke-width", 0.5) // Thinner stroke
        .style("stroke-linejoin", "round")
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text((d) => d.displayText)
        .on("mouseover", function (event, d) {
          isHovering = true;
          d3.select(this).style("cursor", "pointer");
          d3.select(this).append("title").text(d.text); // Show full name on hover
        })
        .on("click", function (event, d) {
          if (isHovering) return;

          tooltip
            .style("display", "block")
            .html(`<strong>${d.text}</strong><br/>`)
            .style("top", `${event.pageY}px`)
            .style("left", `${event.pageX}px`);
          clearTimeout(clickTimeout); // Clear any existing timeout
          clickTimeout = setTimeout(() => {
            tooltip.style("display", "none");
          }, 1000); // Hide the tooltip after 1 second
        });
    }
  };

  return (
    <Box
      ref={wordCloudRef}
      className="chart-container-transparent"
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: "10px",
        width: "100%",
        height: "100%",
        overflow: "hidden", // Prevent overflow
      }}
    >
      <svg id="d3-word-cloud" style={{ width: "100%", height: "100%" }}></svg>
    </Box>
  );
};

export default WordCloud;
