import React from 'react';
import './css/truthTable.css';
import {TableSquare, SelectionButton} from './buildComponents.js';

// TŘÍDY TÝKAJÍCÍ SE PRAVDIVOSTNÍ TABULKY
export default class TruthTable extends React.Component {
  
    render() {
      const sel = this.props.squares;
      const typeMap = this.props.typeMap;
      const perm = this.props.perm;
      let i = 0;
  
      return (
        <div key={i++}>
          <TableH
            typeMap={typeMap}
            key={i++} />
          <div className="bodyTruthTable" key={i++}>
            <Permutation
              key={i++}
              typeMap={typeMap}
              perm={perm}
            />
            <TableValSelection
              squares={sel}
              typeMap={typeMap}
              perm={perm}
              key={i++}
              onClick={(i, j) => this.props.onClick(i, j)}
              setRowOrColCell={(i, j, k, val) => this.props.setRowOrColCell(i, j, k, val)} />
          </div>
        </div>
      );
    }
  
  }
  
class Permutation extends React.Component { // komponenta, která generuje permutace

    renderTableSquare(val, i) { // generuje jednotlivé buňky s hodnotou 0 nebo 1
      return (
        <TableSquare
          value={val}
          key={i}
          className="square tableFont"
        />
      );
    }
    renderTableCol2(j, perm) {
      const typeMap = this.props.typeMap;
      //console.log(perm);
      var html = [];
      let temp = Math.pow(2, typeMap);
  
      for (let i = 0; i < temp; i++) {     // buňky jsou generovány pomocí cyklu, jejich počet je určitě 2^typeMap pro každý sloupec
        html.push(this.renderTableSquare(perm[i][j], i));
      }
      return html;
    }
  
    renderTableCol(j, perm) {     //colonna per unità binaria (esempio in decimale -> centinaia, decina, unità ecc)
      return (
        <div className="table-col" key={j}>
          {this.renderTableCol2(j, perm) // tato funkce skutečně generuje (vykresluje) buňky
          }
        </div>
      );
    }
    renderTablePermutation(perm) {
      const typeMap = this.props.typeMap;
      var html = [];      // návratové pole, do kterého vkládám (pushuju) prvky
  
      for (let j = 0; j < typeMap; j++)   // cyklus for, který generuje sloupce
        html.push(this.renderTableCol(j, perm)); // vložení (push) sloupců do pole, které bude následně vloženo do divu s permutacemi 
  
      return html;
    }
    render() {
      const perm = this.props.perm;
      // volám funkci pro vygenerování permutací
      return this.renderTablePermutation(perm);
    }
  }
  
class TableH extends React.Component {    // komponenta, která generuje hlavičku tabulky
    renderTableHead(a, i) {
      return (
        <TableSquare value={a} key={i} k={i} className="square tableFont" />
      );
    }
  
    renderTableRow() {
      const typeMap = this.props.typeMap;
      let alphabet = ["A", "B", "C", "D"];
      let a = [];
      let i = 0
      for (; i < typeMap; i++)
        a.push(this.renderTableHead(alphabet[i], i));
      a.push(this.renderTableHead("f", i + 1));
      return a;
  
    }
    render() {
      return <div className="tableHead" key={-1}> {this.renderTableRow()} </div>;
    }
  }
    
class TableValSelection extends React.Component { // komponenta, která generuje tlačítka tabulky
  
    renderSelectionButton(i, j, k) {
      return (
        <SelectionButton
          value={this.props.squares[i][j][0]}
          key={k}
        />
      );
    }
  
    renderTableCol() {
      const typeMap = this.props.typeMap;
      const squares = this.props.squares;
      let a = [];
      let r = typeMap;
      let c = typeMap;
      if (typeMap === 3) {
        c = 4;
        r = 2;
      }
      let key = 0;
    
      const customOrder4 = [
        [0, 2, 6, 4],
        [1, 3, 7, 5],
        [9, 11, 15, 13],
        [8, 10, 14, 12]
      ];
    
      if (typeMap === 4) {
        // === 4 proměnné: správné pořadí 0-15 ===
        for (let targetDecimal = 0; targetDecimal <= 15; targetDecimal++) {
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
              const currentDecimal = customOrder4[row][col];
              if (currentDecimal === targetDecimal) {
                a.push(this.renderSelectionButton(row, col, key++));
              }
            }
          }
        }
      } else {
        // === staré chování pro 2 a 3 proměnné ===
        for (let i = 0; i < c; i++) {
          let l;
          if (i === 2) l = 3;
          else if (i === 3) l = 2;
          else l = i;
          for (let j = 0; j < r; j++) {
            let k;
            if (j % r === 2) k = 3;
            else if (j % r === 3) k = 2;
            else k = j;
            a.push(this.renderSelectionButton(k, l, key++));
          }
        }
      }
    
      return a;
    }
  
    render() {
      return <div className="table-col-selButton"> {this.renderTableCol()} </div>;
    }
  }  