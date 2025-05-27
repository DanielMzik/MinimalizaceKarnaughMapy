// OutputMap.js
import React from 'react';
import './css/Map.css';
import { TableSquare, Square } from './buildComponents.js';

export default class OutputMap extends React.Component {
  renderSquare(i, j) {
    return (
      <Square
        value={this.props.squares[i][j][0]}
        i={i}
        j={j}
        onClick={null}
        key={i + j}
      />
    );
  }

  generateMapRow(i) {
    const cols = this.props.typeMap === 3 ? 4 : this.props.typeMap;
    return Array.from({ length: cols }, (_, j) => this.renderSquare(i, j));
  }

  renderMap() {
    const rows = this.props.typeMap === 3 ? 2 : this.props.typeMap;
    return Array.from({ length: rows }, (_, i) => (
      <div className="board-row" key={i}>{this.generateMapRow(i)}</div>
    ));
  }

  renderHeader() {
    const string = this.props.typeMap === 2 ? ["0", "1"] : ["00", "01", "11", "10"];
    const cols = this.props.typeMap === 3 ? 4 : this.props.typeMap;
    const header = [this.renderMapHead(false, "", "headerSquare")];
    for (let i = 0; i < cols; i++) {
      header.push(this.renderMapHead(true, string[i], "headerSquare"));
    }
    return <div className="board-row">{header}</div>;
  }

  renderMapHead(check, a, className) {
    const alp = ["B", "C", "A", "D"];
    if (check) {
      return <TableSquare value={a} key={a} className={className} />;
    } else {
      const labels = alp.slice(0, this.props.typeMap).map((char, i) => (
        <div key={i} className={i < 2 ? "mapVariableTop" : "mapVariableBot"}>{char}</div>
      ));
      return <TableSquare value={labels} key="vars" className={className} />;
    }
  }

  renderColLabels() {
    const string = this.props.typeMap === 2 || this.props.typeMap === 3 ? ["0", "1"] : ["00", "01", "11", "10"];
    return (
      <div className="map-col">
        {string.map((val, i) =>
          this.renderMapHead(true, val, "headerSquare")
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderColLabels()}
        <div className="map">{this.renderMap()}</div>
      </div>
    );
  }
}
