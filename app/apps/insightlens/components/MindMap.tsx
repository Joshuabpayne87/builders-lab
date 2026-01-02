"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';

interface MindMapProps {
  data: MindMapNode;
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = 600;
    
    // Create hierarchy
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<MindMapNode>().size([height - 100, width - 250]);
    treeLayout(root);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(100,0)"); // Left padding

    // Links (Axons)
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .attr("fill", "none")
      .attr("stroke", "#4f46e5") // Indigo-600
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("filter", "drop-shadow(0 0 2px #4f46e5)"); // Glow effect

    // Nodes (Neurons)
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Node Circles
    node.append("circle")
      .attr("r", (d) => d.depth === 0 ? 10 : 6)
      .attr("fill", (d) => d.children ? "#06b6d4" : "#e2e8f0") // Cyan for parents, white for leafs
      .attr("stroke", (d) => d.depth === 0 ? "#8b5cf6" : "#0f172a") // Violet stroke for root
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0 0 5px rgba(6, 182, 212, 0.5))"); // Neon Glow

    // Labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => d.children ? -15 : 15)
      .style("text-anchor", (d) => d.children ? "end" : "start")
      .text((d) => d.data.name)
      .attr("fill", (d) => d.depth === 0 ? "#fff" : "#cbd5e1")
      .style("font-size", (d) => d.depth === 0 ? "16px" : "14px")
      .style("font-weight", (d) => d.depth === 0 ? "bold" : "normal")
      .style("font-family", "'Plus Jakarta Sans', sans-serif")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
      .clone(true).lower()
      .attr("stroke", "#020617") // Dark background stroke for readability
      .attr("stroke-width", 3);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full overflow-auto bg-slate-950/50 rounded-xl border border-indigo-500/20 shadow-inner custom-scrollbar">
      <svg ref={svgRef} className="min-w-full"></svg>
    </div>
  );
};

export default MindMap;
