import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { Box, Heading, Text } from "@chakra-ui/react";
import "../css/Components.css";

const NetworkGraph = ({ playlists, isMobile }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  let clickTimeout = null; // Change this from const to let
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (playlists.length > 0) {
      drawNetworkGraph(playlists);
    }
  }, [playlists]);

  const drawNetworkGraph = (playlists) => {
    const svg = d3
      .select("#d3-network-graph")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${isMobile ? 400 : 800} ${isMobile ? 300 : 600}`)
      .classed("svg-content-responsive", true)
      .style("background-color", "transparent");

    svg.selectAll("*").remove();

    const width = isMobile ? 400 : 800;
    const height = isMobile ? 300 : 600;

    const nodes = playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
    }));

    const links = [];
    const artistMap = {};

    playlists.forEach((playlist) => {
      playlist.artists.forEach((artist) => {
        if (!artistMap[artist]) {
          artistMap[artist] = [];
        }
        artistMap[artist].push(playlist.id);
      });
    });

    Object.values(artistMap).forEach((playlistIds) => {
      for (let i = 0; i < playlistIds.length; i++) {
        for (let j = i + 1; j < playlistIds.length; j++) {
          const source = playlistIds[i];
          const target = playlistIds[j];
          const existingLink = links.find(
            (link) =>
              (link.source === source && link.target === target) ||
              (link.source === target && link.target === source)
          );
          if (existingLink) {
            existingLink.strength += 1;
            existingLink.sharedArtists.push(
              ...Object.keys(artistMap).filter(
                (artist) =>
                  artistMap[artist].includes(source) &&
                  artistMap[artist].includes(target)
              )
            );
          } else {
            links.push({
              source,
              target,
              strength: 1,
              sharedArtists: Object.keys(artistMap).filter(
                (artist) =>
                  artistMap[artist].includes(source) &&
                  artistMap[artist].includes(target)
              ),
            });
          }
        }
      }
    });

    links.forEach((link) => {
      link.sharedArtists = [...new Set(link.sharedArtists)];
    });

    setConnections(links);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => 150 / d.strength)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20));

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(d.strength) * 2);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => color(d.id))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

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

    node
      .on("mouseover", (event, d) => {
        setIsHovering(true);
        clearTimeout(hoverTimeout);
        tooltip.style("display", "block").html(`<strong>${d.name}</strong>`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        setIsHovering(false);
        clearTimeout(hoverTimeout);
        tooltip.style("display", "none");
      })
      .on("click", (event, d) => {
        if (isHovering) return;
        tooltip.style("display", "block").html(`<strong>${d.name}</strong>`);
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          tooltip.style("display", "none");
        }, 3000);
      });

    link
      .on("mouseover", (event, d) => {
        const sharedArtists = d.sharedArtists.join(", ");
        setIsHovering(true);
        clearTimeout(hoverTimeout);
        tooltip
          .style("display", "block")
          .html(
            `<strong>Playlists:</strong> ${d.source.name} & ${d.target.name}<br/><strong>Shared Artists:</strong> ${sharedArtists}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        setIsHovering(false);
        clearTimeout(hoverTimeout);
        tooltip.style("display", "none");
      })
      .on("click", (event, d) => {
        const sharedArtists = d.sharedArtists.join(", ");
        if (isHovering) return;
        tooltip
          .style("display", "block")
          .html(
            `<strong>Playlists:</strong> ${d.source.name} & ${d.target.name}<br/><strong>Shared Artists:</strong> ${sharedArtists}`
          );
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          tooltip.style("display", "none");
        }, 3000);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <Box
      className="chart-container-transparent"
      style={{ flex: 1, padding: "10px" }}
    >
      <svg
        id="d3-network-graph"
        style={{ width: "100%", height: "100%" }}
      ></svg>
      <Box mt={4}>
        <Heading as="h4" size="md" mb={2}>
          Connections Overview
        </Heading>
        {connections.map((connection, index) => (
          <Text key={index} fontSize="sm" mb={2}>
            <strong
              style={{
                color:
                  d3.schemeCategory10[
                    playlists.findIndex((p) => p.id === connection.source.id)
                  ],
              }}
            >
              {connection.source.name}
            </strong>{" "}
            and{" "}
            <strong
              style={{
                color:
                  d3.schemeCategory10[
                    playlists.findIndex((p) => p.id === connection.target.id)
                  ],
              }}
            >
              {connection.target.name}
            </strong>{" "}
            share the following artists: {connection.sharedArtists.join(", ")}
          </Text>
        ))}
        <Text mt={4} fontSize="sm">
          Hover over the data points and connections on the chart to view
          additional details.
        </Text>
        <Text mt={4} fontSize="sm">
          Note: This graph displays your public playlists only. If you have a
          limited number of playlists, the graph may not contain many nodes.
        </Text>
      </Box>
    </Box>
  );
};

export default NetworkGraph;
