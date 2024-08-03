import React, { useEffect } from "react";
import * as d3 from "d3";
import { Select, Box } from "@chakra-ui/react";
import "../css/Components.css";

const MostPlayedGenres = ({ topGenres, timeRange, setTimeRange }) => {
  let isHovering = false;
  let hoverTimeout = null;
  let clickTimeout = null;
  useEffect(() => {
    if (topGenres.length > 0) {
      drawGenresChart(topGenres);
    }
  }, [topGenres]);

  const drawGenresChart = (genres) => {
    const svg = d3
      .select("#d3-genres-chart")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${800} ${650}`)
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    svg.selectAll("*").remove(); // Clear the chart before drawing

    const margin = {
      top: 20,
      right: 30,
      bottom: 150,
      left: 50,
    };

    const width = 800 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(genres.map((d) => d.genre))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(genres, (d) => d.count)])
      .nice()
      .range([height, 0]);

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
      .data(genres)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.genre))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .style("fill", "steelblue")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", function (event, d) {
        isHovering = true;
        const description = d.description || "No artists available";
        const maxArtists = 5;
        const artistList = description.split(": ")[1];
        const artists = artistList ? artistList.split(", ") : [];
        const displayedArtists = artists.slice(0, maxArtists).join(", ");
        const ellipsis = artists.length > maxArtists ? "..." : "";
        const finalDescription = `Artists: ${displayedArtists}${ellipsis}`;
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.genre}</strong><br/>Artists Count: ${d.count}<br/> ${finalDescription}`
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
          const description = d.description || "No artists available";
          const maxArtists = 5;
          const artistList = description.split(": ")[1];
          const artists = artistList ? artistList.split(", ") : [];
          const displayedArtists = artists.slice(0, maxArtists).join(", ");
          const ellipsis = artists.length > maxArtists ? "..." : "";
          const finalDescription = `Artists: ${displayedArtists}${ellipsis}`;
          tooltip
            .style("display", "block")
            .html(
              `<strong>${d.genre}</strong><br/>Artists Count: ${d.count}<br/> ${finalDescription}`
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
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold");

    chart
      .append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format("d"))) // Ensure solid numbers on y-axis
      .selectAll("text")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .style("font-weight", "bold");

    // Wrap text for x-axis labels
    xAxis.each(function () {
      d3.select(this)
        .attr("dy", "1em")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .call(wrapText, 150); // Increase the width for text wrapping
    });

    function wrapText(text, width) {
      text.each(function () {
        const text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy"));

        let line = [],
          lineNumber = 0,
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", `${dy}em`);

        while (words.length > 0) {
          const word = words.pop();
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", `${++lineNumber * lineHeight + dy}em`)
              .text(word);
          }
        }
      });
    }

    // Add y-axis label
    svg
      .append("text")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", margin.left - 30)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-family", "'Poppins', sans-serif")
      .text("Artists")
      .style("font-weight", "bold");
  };

  return (
    <Box
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px" }}
    >
      <svg id="d3-genres-chart" style={{ width: "100%", height: "100%" }}></svg>
      <Box className="time-range-controls">
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="dropdown"
        >
          <option value="short_term">Last 4 weeks</option>
          <option value="medium_term">Last 6 months</option>
          <option value="long_term">All time</option>
        </Select>
      </Box>
    </Box>
  );
};

export default MostPlayedGenres;
