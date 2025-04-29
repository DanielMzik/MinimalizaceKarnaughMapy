import React from 'react';
import './css/KMap.css';
import './css/drawGroup.css';
import $ from 'jquery';
import Map from './Map.js';
import TruthTable from './truthTable.js';
import OptionButton from './optionButton.js';
import LogicCircuitGo from './LogicCircuitGo';


export default class KarnaughMap extends React.Component {
    constructor(props) {
      super(props);
  
      let t = 4;
      let a = this.getMatrixSquare(t);
      let p = this.getMatrixPerm(t);
      let m = this.setCoord(a, p, t);
      let s = "SOP";
      this.state = {
        squares: m,   // matice hodnot mapy
        typeMap: t,   // typ mapy, která se má geelementsInRowovat
        perm: p,      // matice permutací
        typeSol: s,    //SOP nebo POS
        logicExpression: "", // nový state
        inputMinterms: "",
        inputDontCares: "",
        allValidSolutions: [],
        currentSolutionIndex: 0,
        EquationType: "Dis"
        
      };
    }

    // Funkce pro změnu zobrazené rovnice
    setEquationType = (type) => {
      this.setState({ EquationType: type });
    }
    
  
    // metoda, která vrací matici binárních hodnot na základě zadané velikosti
    getMatrixPerm(dim) {
      let col = dim;
      let row = Math.pow(2, dim);  // počet řádků je dán mocninou dvou podle zadané dimenze
      let a = [];                   // pomocná matice
      for (let i = 0; i < row; i++) {   // vytvoření matice (vložení sloupců pro každý řádek)
        let temp = [];
        for (let j = 0; j < col; j++)
          temp[j] = 0;
        a[i] = temp;
      }
  
      for (let j = 0; j < col; j++) {       
        let count = (Math.pow(2, dim)) / 2; // počet po sobě jdoucích 0 nebo 1, které se budou opakovat
  
        for (let i = 0; i < row; i++) {     // iterace přes řádky (kombinace proměnných)
          let val = (i % (count * 2) < count) ? 0 : 1;  //střídání 0 a 1 podle vzoru
          a[i][j] = "" + val;                          // uložení jako řetězec
        }
        dim--;                        // snížení dimenze, aby se v dalším sloupci střídání zkrátilo
      }
      return a;
    }
  
    getMatrixSquare(dim) {      // vytvoří matici, která tvoří mapu
      let row = dim;
      let col = dim;
      let deep = 2;             // jedná se o trojrozměrnou matici, kde [.][.][0] obsahuje hodnotu mapy, [.][.][1] a [.][.][2] souřadnice
                                // sloupce a řádku
      if (dim === 3) {          // kontrola pro případ s 3 proměnnými
        row = 2;
        col = 4;
      }
  
      let a = [];                   // nastavení matice vložením vektorů jeden do druhého
      for (let i = 0; i < row; i++) {
        let temp = [];
        for (let j = 0; j < col; j++) {
          let t = [];
          for (let k = 0; k < deep; k++)
            t[k] = 0;
          temp[j] = t;
        }
        a[i] = temp;
      }
      return a;
    }
  
    setMatrixSquare(val) {                // metoda, která nastaví hodnotu matice na 1, 0 nebo X
      const squares = this.state.squares;
      const typeMap = this.state.typeMap;
      let r = typeMap;
      let c = typeMap;
      if (typeMap === 3) {
        r = 2;
        c = 4;
      }

      for (let i = 0; i < r; i++)
        for (let j = 0; j < c; j++) {
          squares[i][j][0] = val;
        }
      
      this.reset();
      this.setState({
        squares: squares,
        inputMinterms: "",   
        inputDontCares: "" 
      });
    }
  
    reset(){   // resetovací metoda, která znovu nastaví výchozí nastavení pro nový výpočet
      this.clearDrawings(); // <<< přidat SEM jako první věc                           
      const typeMap = this.state.typeMap;
      let r = typeMap;
      let c = typeMap;
      if (typeMap === 3) {
        r = 2;
        c = 4;
      }
      $("#elabora").prop("disabled", false);  // znovu povolí tlačítko (nastaví ho jako aktivní)
  
      for (let i = 0; i < r; i++)             // odstraní vykreslení skupin
        for (let j = 0; j < c; j++) {
          $("#output_" + i + j).removeClass();
          $("#output_" + i + j).html("");
          for (let k = 0; k < 10; k++)
            $("#" + i + j + k).remove();          
        }
      
        $("#sol").html("");                 // odstraní řešení
        $("#cost").html("");
        $(".Solution").hide();
        $(".kMapOutput").hide();
        $(".truthTable").hide();     
        $(".nameTab").hide();
        $(".solutionSwitcher").hide();        
        $(".Solution").css("left","720px");
    }
  
    setCoord(squares, perm, typeMap) { // kód, který nastavuje souřadnice viditelné nahoře a na boku mapy
      let r = typeMap;            // squares[i][j][0] = prvek zobrazený v matici
      let c = typeMap;            // squares[i][j][1] = souřadnice sloupce
      // squares[i][j][2] = souřadnice řádku
      if (typeMap === 3) {         // kontrola pro mapu se 3 proměnnými
        c = 4;
        r = 2;
      }
      for (let i = 0; i < c; i++) {   // první for cyklus procházející sloupce
        let l;
        if (i === 2) l = 3;          // provádí potřebné záměny (kvůli Grayovu kódu)
        else if (i === 3) l = 2;
        else l = i;
  
        for (let j = 0; j < r; j++) { // vnořený for cyklus procházející řádky
          let k;
          if (j % r === 2) k = 3;       // provádí potřebné záměny (kvůli Grayovu kódu)
          else if (j % r === 3) k = 2;
          else k = j;
          // začátek nastavení souřadnic
          let val = "";
          let t = typeMap;
  
          let p = 0;
          // metoda pro rozdělení na dvě buňky – zvlášť souřadnice sloupce a řádku
          do {
            val += perm[i * r + j][p];    // i*r+j – vzorec, který umožňuje procházet pole jako by to byla matice s r řádky a c sloupci
            p++;
          } while (p < t / 2);
          squares[k][l][1] = val;   // nastavení souřadnice sloupce
          val = "";
          p = Math.floor(t / 2);
          if (typeMap === 3) {        // případ matice pro 3 proměnné
            t = 2;
            p = Math.floor(t / 2 + 1);
          }
          do {
            val += perm[i * r + j][p];
            p++;
          } while (p < t);
          squares[k][l][2] = val; // nastavení souřadnice řádku
          //console.log("vett: "+(i*r+j)+" col: "+l+"  rig: "+k); 
        }
      }
      // console.log(squares);
      return squares;
    }
  
    setTypeMap(val) {                     //nastaví typ mapy a všechny související hodnoty, aby bylo možné provést čistý výpočet
      let a = this.getMatrixSquare(val);
      let b = this.getMatrixPerm(val);
      let c = this.setCoord(a, b, val);
      this.reset();
      this.setState({
        typeMap: val,
        squares: c,
        perm: b,
        inputMinterms: "",
        inputDontCares: ""  
      });
    }
  
    setTypeSol(type) {
      this.clearDrawings();  // Vymaže vykreslené skupiny, pokud nějaké existují
      this.reset();          // Resetuje všechny výstupy a tabulky
    
      // Zachováme hodnoty mintermů a don't cares
      const { inputMinterms, inputDontCares } = this.state;
    
      // Pouze změníme typ (SOP/POS) bez ovlivnění hodnot
      this.setState({
        typeSol: type,
        inputMinterms: inputMinterms,  // Zachováme hodnoty zadané uživatelem
        inputDontCares: inputDontCares,
        allValidSolutions: [], // Reset všech platných řešení
        currentSolutionIndex: 0 // Reset indexu aktuálního řešení
      });
    }
  
    handleClick(i, j) {
      const squares = this.state.squares;
    
      if (squares[i][j][0] === 1) {
        squares[i][j][0] = 0;
      } else if (squares[i][j][0] === 0) {
        squares[i][j][0] = 'X';
      } else if (squares[i][j][0] === 'X') {
        squares[i][j][0] = 1;
      }
    
      this.clearDrawings();  // <<< smažeme staré zvýraznění
      this.reset();          // <<< skryjeme výstupy, pravdivostní tabulku atd.
    
      this.setState({
        squares: squares,
        allValidSolutions: [],  // <<< reset řešení
        currentSolutionIndex: 0,
        logicExpression: "",
      }, () => {
        this.updateInputsAndFunctionFromMap(); // znovu načti vstupy
      });
    }

updateInputsAndFunctionFromMap() {
  const squares = this.state.squares;
  const minterms = [];
  const dontCares = [];

  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      let decimal;
      if (this.state.typeMap === 4) {
        decimal = customGrayCode4[i][j];
      } else {
        const binary = squares[i][j][1] + squares[i][j][2];
        decimal = parseInt(binary, 2);
      }

      if (this.state.typeSol === "SOP") {
        if (squares[i][j][0] === 1) {
          minterms.push(decimal);
        } else if (squares[i][j][0] === 'X') {
          dontCares.push(decimal);
        }
      } else if (this.state.typeSol === "POS") {
        if (squares[i][j][0] === 1) {
          minterms.push(decimal);
        } else if (squares[i][j][0] === 'X') {
          dontCares.push(decimal);
        }
      }
    }
  }

  this.setState({
    inputMinterms: minterms.sort((a, b) => a - b).join(','),
    inputDontCares: dontCares.sort((a, b) => a - b).join(',')
  });
}

    

    getFunctionLabel() {
      const allVars = ['a', 'b', 'c', 'd'];
      const selectedVars = allVars.slice(0, this.state.typeMap);
      return `f(${selectedVars.join(',')}) =`;
    }

    applyExpressionInputs() {
      const maxRange = Math.pow(2, this.state.typeMap) - 1;
      const val = this.state.typeSol === "SOP" ? 1 : 0;  // základní hodnota pro klikání, ale pozor, jinak budeme generovat mapu
    
      const validFormat = /^[0-9\s,]*$/;
    
      if (
        (this.state.inputMinterms && !validFormat.test(this.state.inputMinterms)) ||
        (this.state.inputDontCares && !validFormat.test(this.state.inputDontCares))
      ) {
        alert("Chyba: Vstupy musí obsahovat pouze čísla oddělená čárkami.");
        return;
      }
    
      const minterms = this.state.inputMinterms
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
    
      const dontCares = this.state.inputDontCares
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
    
      if (minterms.some(n => n < 0 || n > maxRange)) {
        alert(`Chyba: Čísla musí být v rozsahu 0 až ${maxRange}.`);
        return;
      }
    
      if (dontCares.some(n => n < 0 || n > maxRange)) {
        alert(`Chyba: Čísla musí být v rozsahu 0 až ${maxRange}.`);
        return;
      }
    
      const duplicates = minterms.filter(n => dontCares.includes(n));
      if (duplicates.length > 0) {
        alert("Chyba: Některá čísla jsou stejná v mintermech a don't care.");
        return;
      }
    
      const squares = this.getMatrixSquare(this.state.typeMap);
      const perm = this.getMatrixPerm(this.state.typeMap);
      const map = this.setCoord(squares, perm, this.state.typeMap);
    
      // === Velká změna: Nejprve všechno nastavím podle režimu ===
      const baseVal = (this.state.typeSol === "SOP") ? 0 : 1;
    
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
          map[i][j][0] = baseVal;
        }
      }
    
      // === Pak přepíšu hodnoty podle minterms a dontCares ===
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
          let decimal;
          if (this.state.typeMap === 4) {
            decimal = customGrayCode4[i][j];
          } else {
            const binary = map[i][j][1] + map[i][j][2];
            decimal = parseInt(binary, 2);
          }
    
          if (this.state.typeSol === "SOP") {
            if (minterms.includes(decimal)) {
              map[i][j][0] = 1;
            } else if (dontCares.includes(decimal)) {
              map[i][j][0] = "X";
            }
            // jinak 0 už tam je
          } else if (this.state.typeSol === "POS") {
            if (minterms.includes(decimal)) {
              map[i][j][0] = 0; // POZOR: v POS když číslo je zadané, znamená 0
            } else if (dontCares.includes(decimal)) {
              map[i][j][0] = "X"; // don't care taky změním
            }
            // jinak 1 už tam je
          }
        }
      }
    
      this.reset();
      this.setState({ squares: map });
    }
    

    
    clearDrawings() {
      const typeMap = this.state.typeMap;
      let rows = typeMap;
      let cols = typeMap;
      if (typeMap === 3) {
        rows = 2;
        cols = 4;
      }
    
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const baseId = `#output_${i}${j}`;
          $(baseId).removeClass();                     // smaže všechny CSS třídy
          $(baseId).css("border-color", "");           // reset barvy rámečku
          $(baseId).html("");                          // smaže obsah (např. .backgr)
          for (let k = 0; k < 10; k++) {
            $(`${baseId}${k}`).remove();               // odstraní všechny přidané vrstvy divů
          }
        }
      }
    }
    
    
    
    Algorithm(squares) {
  
      $("#elabora").prop("disabled", true);
      var dimCol, dimRow;
      const typeSol = this.state.typeSol;
      let val = (typeSol === "SOP")? 1 : 0 ;
  
      if (this.state.typeMap === 4) {
        dimCol = 4;
        dimRow = 4;
      }
      else
        if (this.state.typeMap === 3) {
          dimCol = 4;
          dimRow = 2;
        }
        else {
          dimCol = 2;
          dimRow = 2;
        }
  
      var groups = new Array(dimRow); // vytvořím řádky
  
      for (let i = 0; i < dimRow; i++) {
        groups[i] = new Array(dimCol); // vytvořím sloupce
  
        for (let j = 0; j < dimCol; j++)
          groups[i][j] = []; // pro každou buňku vytvořím pole
      }
  
      var index = 0; // pro určení jednotlivých (dočasných) skupin
      for (let i = 0; i < dimRow; i++) {
        for (let j = 0; j < dimCol; j++) {
  
          var count = 0; // počítá, kolik prvků bylo nalezeno (dočasně), slouží ke kontrole, zda jde o mocninu dvojky
  
          if (squares[i][j][0] === val || (squares[i][j][0] === 'X' && this.hasOneNeighbour(squares, i, j, val))) { // pokud je buňka vybrána (např. 1 nebo X se sousedem)
            // hodnoty i a j zůstávají nezměněné
            var TempI = i;
            var TempJ = j;
  
            if (j === dimCol - 1)// nacházím se v posledním sloupci, provedu kontrolu hran
            {
              let ok = true;
              let count2 = 0;
  
              for (let height = i; height < dimRow && ok; height++)
                if ((squares[height][dimCol - 1][0] === val || squares[height][dimCol - 1][0] === 'X') &&
                    (squares[height][0][0] === val || squares[height][0][0] === 'X')) {
                    groups[height][0].push(index);
                    groups[height][dimCol - 1].push(index);
                    count2++;
                }
                else
                  ok = false;
  
              if (count2 > 0) {
                index++;
  
                if (!isPower(2, count2)) {
                  groups[i + count2 - 1][0].pop();
                  groups[i + count2 - 1][dimCol - 1].pop();
                } 
              }
  
            }
  
            if (i === dimRow - 1)// nacházím se v posledním řádku, provádím kontrolu okrajů
            {
              let ok = true;
              let count2 = 0;
  
              for (let column = j; column < dimCol && ok; column++)
                if ((squares[dimRow - 1][column][0] === val || squares[dimRow - 1][column][0] === 'X') &&
                  (squares[0][column][0] === val || squares[0][column][0] === 'X')) {
                  groups[dimRow - 1][column].push(index);
                  groups[0][column].push(index);
                  count2++;
                }
                else
                  ok = false;
  
              if (count2 > 0) {
                index++;
  
                if (!isPower(2, count2)) {
                  groups[dimRow - 1][j + count2 - 1].pop();
                  groups[0][j + count2 - 1].pop();
                }
              }
  
            }
  
            do { // Kontrola horizontálních buněk sousedících s danou
              groups[TempI][TempJ].push(index); // Označím, že jsem našel skupinu propojenou s vybraným prvkem
              count++;
              TempJ++;
            } while (TempJ < dimCol && (squares[TempI][TempJ][0] === val || squares[TempI][TempJ][0] === 'X'));
            
  
            if (!isPower(2, count)) // je count mocninou čísla 2?
            {
              groups[TempI][TempJ - 1].pop(); // odstraním poslední vložený prvek
              count--;
            }
  
            var CountVer;
            var depth = 100; // udává, kolik řádků ve sloupci prvku je platných
            var isOk = true; // slouží ke kontrole, zda nedochází k přerušení ve sloupci
            for (let offset = 0; offset < count; offset++) { // pro každý sloupec
              TempI = i + 1;
              TempJ = j + offset;
              CountVer = 1;
  
              while (TempI < dimRow && CountVer < depth) {
                if (!(squares[TempI][TempJ][0] === val || squares[TempI][TempJ][0] === 'X')) {
                  if (offset !== 0 && CountVer !== depth) { //umožňuje "označit" skutečně použitelné skupiny
  
                    var rig = TempI;
                    if (!isPower(2, offset))// v případě matice 4x4 pouze když spo=3
                    {

  
                      if (!isPower(2, CountVer)) // je třeba znát výšku vůči vybranému prvku
                        rig--;
  
                      groups[TempI][TempJ].push(index); // vyhne se kontrole v dalších smyčkách – nelze odstranit něco, co ještě nebylo vloženo
  
                      if (TempI >= depth) // podle toho, kde se nacházím, použiji výšku skupiny (depth) nebo aktuální výšku
                        depth = TempI;
                      else
                        depth--;
  
                      for (; rig <= depth; rig++)
                        for (let col = TempJ - 1; col <= offset; col++)
                          groups[rig][col].pop();
  
                      isOk = false; // pro následující kontrolu (nižší úrovně)
                    }
                  }
                  break;
                }
                groups[TempI][TempJ].push(index);
                TempI++;
                CountVer++;
              }
  
              if (CountVer < depth)
                depth = CountVer;
  
              if (!isPower(2, CountVer) && isOk) { // protože jsem již "vyčistil" (odstranil) při nastavení isOk na false, nemusím to dělat znovu
                groups[TempI - 1][TempJ].pop();
                depth--;
              }
            }
            index++;
          }
        }
  
      }
      if (
        (squares[0][dimCol - 2][0] === val || squares[0][dimCol - 2][0] === 'X') &&
        (squares[0][dimCol - 1][0] === val || squares[0][dimCol - 1][0] === 'X') &&
        (squares[dimRow - 1][dimCol - 2][0] === val || squares[dimRow - 1][dimCol - 2][0] === 'X') &&
        (squares[dimRow - 1][dimCol - 1][0] === val || squares[dimRow - 1][dimCol - 1][0] === 'X')
      ) {
        groups[0][dimCol - 2].push(index);
        groups[0][dimCol - 1].push(index);
        groups[dimRow - 1][dimCol - 2].push(index);
        groups[dimRow - 1][dimCol - 1].push(index);
        index++;
      }
      console.log("Algorithm:");
      console.log(groups);
      this.setState({ showSolutionButtons: true });
      this.GroupUp(squares, $.extend(true, [], groups));
      
    }
    hasOneNeighbour(squares, i, j, val) {
      const dimRow = squares.length;
      const dimCol = squares[0].length;
    
      const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0]
      ];
    
      for (let [dx, dy] of dirs) {
        const ni = (i + dx + dimRow) % dimRow;
        const nj = (j + dy + dimCol) % dimCol;
        const neighbor = squares[ni][nj][0];
        if (neighbor === val || neighbor === 'X') {
          return true;
        }
      }
      return false;
    }
  
    GroupUp(squares, values) {
      var groups = [];
  
      var group1 = [];
      var group2 = [];
      var obj1, obj2;
      var dimCol, dimRow;
      const typeSol = this.state.typeSol;
      let val = (typeSol === "SOP")? 1 : 0 ;
  
      if (this.state.typeMap === 4) {
        dimCol = 4;
        dimRow = 4;
      }
      else
        if (this.state.typeMap === 3) {
          dimCol = 4;
          dimRow = 2;
        }
        else {
          dimCol = 2;
          dimRow = 2;
        }
  
        if (
          (squares[0][0][0] === val || squares[0][0][0] === 'X') &&
          (squares[0][dimCol - 1][0] === val || squares[0][dimCol - 1][0] === 'X') &&
          (squares[dimRow - 1][0][0] === val || squares[dimRow - 1][0][0] === 'X') &&
          (squares[dimRow - 1][dimCol - 1][0] === val || squares[dimRow - 1][dimCol - 1][0] === 'X')
        )
      {
  
        obj1 = {
          row: 0,
          col: 0
        };
  
        group1.push(obj1);
        
        obj1 = {
          row: 0,
          col: dimCol-1
        };
  
        group1.push(obj1);
        
        obj1 = {
          row: dimRow-1,
          col: 0
        };
  
        group1.push(obj1);
  
        obj1 = {
          row: dimRow-1,
          col: dimCol-1
        };
  
        group1.push(obj1);
  
        groups.push(group1);
  
        if (group1.some(cell => squares[cell.row][cell.col][0] === val)) {
          groups.push(group1);
        }
        group1 = [];
       
      }
  
      for (let i = 0; i < dimRow; i++) {
        for (let j = 0; j < dimCol; j++) {
  
          if (squares[i][j][0] === val || (squares[i][j][0] === 'X' && this.hasOneNeighbour(squares, i, j, val))) { // squares[i][j] je vybraný prvek
  
            var index = values[i][j][0];
            var startRow = i;
            var startCol = j;
  
            if (j === dimCol - 1) {
              while (startRow < dimRow && values[startRow][j][0] === index && values[startRow][0][0] === index) {
  
                obj1 = {
                  row: startRow,
                  col: 0
                };
  
                obj2 = {
                  row: startRow,
                  col: j
                };
  
                values[startRow][j].shift();
                values[startRow][0].shift();
  
                group1.push(obj1);
                group1.push(obj2);
  
                startRow++;
              }
  
              if (group1.length > 0) {
                if (group1.some(cell => squares[cell.row][cell.col][0] === val)) {
                  groups.push(group1);
                }
                group1 = [];
                index = values[i][j][0];
              }
  
  
              startRow = i;
              startCol = j;
  
            }
  
            if (i === dimRow - 1) {
              while (startCol < dimCol && values[i][startCol][0] === index && values[0][startCol][0] === index) {
  
                obj1 = {
                  row: i,
                  col: startCol
                };
  
                obj2 = {
                  row: 0,
                  col: startCol
                };
  
                values[0][startCol].shift();
                values[i][startCol].shift();
  
                group1.push(obj1);
                group1.push(obj2);
  
                startCol++;
              }
  
              if (group1.length > 0) {
                group1.sort(function (a, b) { return a.row - b.row }); // provedu seřazení podle velikosti
                if (group1.some(cell => squares[cell.row][cell.col][0] === val)) {
                  groups.push(group1);
                }
                
                group1 = [];
                index = values[i][j][0];
              }
  
  
              startRow = i;
              startCol = j;
            }
  
            while (startCol < dimCol && values[startRow][startCol][0] === index)
              startCol++;
  
            while (startRow < dimRow && values[startRow][startCol - 1][0] === index)
              startRow++;
  
  
            for (let EleInRow = i; EleInRow < startRow; EleInRow++)
              for (let FineCol = j; FineCol < startCol; FineCol++) {
                obj1 = {
                  row: EleInRow,
                  col: FineCol
                };
                group1.push(obj1);
              }
  
              if (group1.some(cell => squares[cell.row][cell.col][0] === val)) {
                groups.push(group1);
              }
              
  
            startRow = i;
            startCol = j;
  
            while (startRow < dimRow && values[startRow][startCol][0] === index)
              startRow++;
  
            while (startCol < dimCol && values[startRow - 1][startCol][0] === index)
              startCol++;
  
            for (let EleInRow = i; EleInRow < startRow; EleInRow++)
              for (let FineCol = j; FineCol < startCol; FineCol++) {
                obj1 = {
                  row: EleInRow,
                  col: FineCol
                };
                group2.push(obj1);
              }
  
            var equal = true;
            if (group1.length === group2.length)
            {
              for (let v = 0; v < group1.length && equal; v++)
                if (group1[v].row !== group2[v].row && group1[v].col !== group2[v].col)
                  equal = false;
            }
                  else
                  if (group2.some(cell => squares[cell.row][cell.col][0] === val)) {
                    groups.push(group2);
                  }
                  
  
            if (!equal)
              if (group2.some(cell => squares[cell.row][cell.col][0] === val)) {
                groups.push(group2);
              }
              
  
            group1 = [];
            group2 = [];
  
            for (let k = 0; k < dimRow; k++)
              for (let z = 0; z < dimCol; z++)
                if (values[k][z][0] === index)
                  values[k][z].shift();
  
          }
  
        }
      }
      console.log("GroupUp:");
      console.log(groups);
      this.CleanAlgorithm($.extend(true, [], groups));
    }
    
    CleanAlgorithm(groups) {
      if (this.state.typeMap === 4) {
        groups = filterGroups(groups, this.state.squares, this.state.typeSol);
        groups = removeSubsets(groups);
      }

      groups.sort((a, b) => b.length - a.length); // Seřadit sestupně dle velikosti
      const temp = $.extend(true, [], groups); // Deep copy
    
      const allRelevant = [];
      for (let i = 0; i < this.state.squares.length; i++) {
        for (let j = 0; j < this.state.squares[0].length; j++) {
          if (this.state.typeSol === "SOP") {
            if (this.state.squares[i][j][0] === 1) {
              allRelevant.push(i + "," + j);
            }
          } else if (this.state.typeSol === "POS") {
            if (this.state.squares[i][j][0] === 0) {
              allRelevant.push(i + "," + j);
            }
          }
        }
      }
    
      const totalGroups = temp.length;
      const allValidSolutions = [];
    
      let foundSize = null;
    
      for (let size = 1; size <= totalGroups; size++) {
        const combinations = generateCombinations(temp, size);
    
        for (const combo of combinations) {
          const covered = new Set();
          for (const group of combo) {
            for (const cell of group) {
              covered.add(cell.row + "," + cell.col);
            }
          }
          if (allRelevant.every(coord => covered.has(coord))) {
            if (foundSize === null) {
              foundSize = size;
            }
            if (size === foundSize) { // ukládat jen kombinace s minimálním počtem skupin
              allValidSolutions.push(combo);
            }
          }
        }
        if (foundSize !== null) {
          break; // našli jsme všechna minimální řešení - menší velikost už není
        }
      }
    
      console.log("✅ Všechna minimální řešení:", allValidSolutions);
    
      if (allValidSolutions.length > 0) {
        this.setState({
          allValidSolutions: allValidSolutions,
          currentSolutionIndex: 0
        }, () => {
          this.Solution(this.state.allValidSolutions[0], this.state.allValidSolutions[0]);
          this.drawGroup(this.state.allValidSolutions[0], this.state.allValidSolutions[0]);
        });
      }
    }
    
    
    
  
    Solution(temp, groups) {                         // temp je pole s souřadnicemi správných skupin
      const matrix = this.state.squares;           // hlavní matice
      var varNames = ["A", "B", "C", "D"];               // pole s názvy proměnných matice
      var solution="";                              // řetězec pro výpočet řešení jedné skupiny
      var vectorSol=[];                              // každá položka je řešení jedné skupiny
      var k, j, t;
      // k je index pro procházení pole varNames, j je index pro procházení souřadnic skupin, t je index pro procházení binárních souřadnic
      var refRow, refCol;                    // tyto dvě proměnné obsahují řádek a sloupec prvního prvku skupiny, který je výchozím bodem
      var flag;                                    // pomocná proměnná (sentinel)
      var coord;                                  // proměnná, která obsahuje binární souřadnici, se kterou se pracuje
      var elementsInRow;
      var solutionType=this.state.typeSol;
      for (let i = 0; i < temp.length; i++) {
  
        if (temp[i].length > 0) {
          k = 0;
          refRow = groups[i][0].row;              //extrakce souřadnic referenčního bodu každé skupiny
          refCol = groups[i][0].col;
  
          elementsInRow = 0;
          while (elementsInRow < groups[i].length && groups[i][elementsInRow].row === refRow)  //počítá, kolik prvků je v jednom řádku (využívá se při určení počtu sloupců)
          {
            elementsInRow++;
          }
  
          //ZAČÁTEK KONTROLY ŘÁDKU
          t = 0;
          coord = matrix[refRow][refCol][1];  // coord obsahuje binární souřadnici ve sloupci referenčního bodu
          while (t < coord.length) {
            j = 1;
            flag = true;
            while (j < groups[i].length && groups[i][j].row === refRow) {       // dokud jsou prvky ve stejném řádku
              if (coord.charAt(t) !== matrix[refRow][groups[i][j].col][1].charAt(t)) {  // porovná jednotlivé znaky binárních souřadnic ve sloupcích prvků skupiny
                flag = false;                                               // pokud nejsou stejné, proměnná se nezohlední a cyklus se ukončí
                break;
              }
              j++;
            }
            if (flag) {                        //řešení se aktualizuje pouze tehdy, pokud jsou všechny znaky stejné
              if(solutionType==="SOP")                //tvar SOP
              {
                if (coord.charAt(t) === "0") {
                  solution += "'" + varNames[k];
                }
                else{
                  solution += varNames[k];
                }
              }
              else{                               //tvar POS
                if (coord.charAt(t) === "0") {
                  solution += varNames[k];
                }
                else{
                  solution += "'" + varNames[k];
                }
                solution += "+";
              }
            }
            k++;
            t++;
          }
  
          //ZAČÁTEK KONTROLY ŘÁDKU
          t = 0;
          coord = matrix[refRow][refCol][2];    // coord obsahuje binární souřadnici řádku výchozího bodu
          while (t < coord.length) {
            j = elementsInRow;
            flag = true;
            while (j < groups[i].length && groups[i][j].col === refCol) {   // dokud jsou prvky ve stejném sloupci
              if (coord.charAt(t) !== matrix[groups[i][j].row][refCol][2].charAt(t)) { // porovnává jednotlivé znaky binárních souřadnic řádků prvků náležících do skupiny
                flag = false;                                     // pokud jsou znaky různé, proměnná se nepočítá a cyklus se přeruší
                break;
              }
              j += elementsInRow;
            }
            if (flag) {                        // řešení se aktualizuje pouze tehdy, pokud jsou všechny znaky stejné
              if(solutionType==="SOP")                 //tvar SOP
              {
                if (coord.charAt(t) === "0") {
                  solution +=  "'" + varNames[k];
                }
                else{
                  solution += varNames[k];
                }
              }
              else{                               //tvar POS
                if (coord.charAt(t) === "0") {
                  solution += varNames[k];
                }
                else{
                  solution += "'" + varNames[k];
                }
                solution += "+";
              }
            }
            k++;
            t++;
          }
          if(solutionType==="POS")     // v případě tvaru POS bude na konci řetězce znak "+" a ten je potřeba odstranit
          {
            solution=solution.substr(0,solution.length-1);
          }
          vectorSol.push(solution);
          solution="";
        }
      }
  
      if (vectorSol[0] === "" || !vectorSol[0])   // pokud je řešení prázdný řetězec, znamená to, že matice obsahuje pouze samé 0 nebo samé 1
      {
        
        if (matrix[0][0][0] === 0) {
          vectorSol[0]="0";
        }
        else {
          vectorSol[0]="1";
        }
      }
      console.log("Expression sent to LogicCircuitGo:", vectorSol.join(" + ")); // DEBUG výstup
     // === Uložení minimalizovaného výrazu do state pro LogicCircuitGo
      this.setState({
      logicExpression: vectorSol.join(" + ")  // např. ["A'B", "CD'"] → "A'B + CD'"
    }); 
      this.drawSolution(vectorSol);
    }

    prevSolution() {
      const { currentSolutionIndex, allValidSolutions } = this.state;
      if (currentSolutionIndex > 0) {
        const newIndex = currentSolutionIndex - 1;
        this.setState({ currentSolutionIndex: newIndex }, () => {
          this.clearDrawings();
          const selectedSolution = this.state.allValidSolutions[newIndex];
          this.Solution(selectedSolution, selectedSolution);
          this.drawGroup(selectedSolution, selectedSolution);
        });
      }
    }
    
    nextSolution() {
      const { currentSolutionIndex, allValidSolutions } = this.state;
      if (currentSolutionIndex < allValidSolutions.length - 1) {
        const newIndex = currentSolutionIndex + 1;
        this.setState({ currentSolutionIndex: newIndex }, () => {
          this.clearDrawings();
          const selectedSolution = this.state.allValidSolutions[newIndex];
          this.Solution(selectedSolution, selectedSolution);
          this.drawGroup(selectedSolution, selectedSolution);
        });
      }
    }
  
    drawGroup(temp, groups) {
      let color = ["red", "blue", "green", "orange", "#50C878","lightblue","#CD7F32","#ff6699"];  // pole barev
      let c = -1; // používá se k identifikaci jednotlivých divů, které se pak budou mazat, zároveň určuje barvu k použití
      for (let i = 0; i < temp.length; i++) {  // cyklus, který prochází všechny skupiny
        if (temp[i].length > 0 && groups[i].length !== Math.pow(2, this.state.typeMap)) {
          c++;
          let j = 0;
          let FirstElCol = groups[i][0].col;
          let FirstElRow = groups[i][0].row;
          while (j < groups[i].length) {                                    // cyklus, který prochází všechny buňky jedné skupiny
            let idPrefix = "output_"; // nebo udělej to dynamické podle potřeby
            let element = $("#" + idPrefix + groups[i][j].row + groups[i][j].col);    

            if (element.attr('class') && $("#" + element.attr('id') + c)) { // pokud už byl tento element vykreslen
              element.after("<div id=" + element.attr('id') + c + "></div>"); // vytvoří se nový div hned po něm
              element = $("#" + idPrefix + groups[i][j].row + groups[i][j].col + c);    // a znovu se získá
            }
            //console.log(!element.attr('class'))
            element.css("border-color", color[c]);                            // nastavení barvy okraje
            element.append("<div class='backgr' style='background-color: "+color[c]+"'></div>"); // přidá se podkladová barva (div uvnitř buňky)

            // Vyhodnocení typu buňky podle toho, které další buňky v okolí jsou součástí stejné skupiny
            let right = this.checkElInGroups(j, groups[i], "right"); // doprava
            let below = this.checkElInGroups(j, groups[i], "below");   // dolů
            let left = this.checkElInGroups(j, groups[i], "left"); // doleva
            let above = this.checkElInGroups(j, groups[i], "above"); // nahoru
  
          //  console.log("d: " + right + " sin: " + left + " above: " + above + " below: " + below);
            
          //vyhodnocení případů pro přiřazení správné CSS třídy, která určuje typ seskupení pro vykreslení dané buňky
            if (right) {
              if (below) {
                if (left) {
                  if (groups[i][j].col === FirstElCol) element.addClass("TopLeft");
                  else if (j === ((groups[i].length / 2) - 1) || j === (groups[i].length - 1)) element.addClass("TopRig");
                  else element.addClass("top")
                }
                else if (above) {
                  if (j === groups[i].length - 2 || j === groups[i].length - 1) element.addClass("BotLeft");
                  else if (groups[i][j].row === FirstElRow) element.addClass("TopLeft");
                  else element.addClass("left");
                }
                else  element.addClass("TopLeft");
              }
              else if (above) {
                if (left) {
                  if (groups[i][j].col === FirstElCol) element.addClass("BotLeft");
                  else if (j === groups[i].length - 1 || j === (groups[i].length/2) - 1) element.addClass("BotRig");
                  else element.addClass("bot");
                }
                else element.addClass("BotLeft");
              }
              else if (left) {
                if (j === 0) element.addClass("ClosedLeft")
                else if (j === groups[i].length - 1) element.addClass("ClosedRig");
                else element.addClass("top-bot");
              }
              else element.addClass("ClosedLeft");
            }
  
            else if (above) {
              if (left) {
                if (below) {
                  if (groups[i][j].row === FirstElRow) element.addClass("TopRig");
                  else if (j === groups[i].length - 1 || j === groups[i].length - 2) element.addClass("BotRig");
                  else element.addClass("right");
                }
                else element.addClass("BotRig");
              }
              else if (below) {
                if (j === 0) element.addClass("ClosedTop");
                else if (j === groups[i].length - 1) element.addClass("ClosedBot");
                else element.addClass("left-right");
              }
              else element.addClass("ClosedBot");
            }
  
            else if (left) {
              if (below) element.addClass("TopRig");
              else element.addClass("ClosedRig");
            }
            else if (below) element.addClass("ClosedTop");
            else element.addClass("monoGroup");
            j++;
          }
        }
      }
    }
  
    checkElInGroups(j, groups, lato) {  // Vrací, ve kterém směru se nachází buňky, které patří do stejné skupiny jako zvolená buňka (j je index buňky ve skupině)
      const matrix = this.state.squares;
      let r = matrix[0].length;
      let c = matrix[0].length;
      if (this.state.typeMap === 3) {
        r = 2;
        c = 4;
      }
      // Cyklus, který kontroluje, zda sousední buňky patří do stejné skupiny – podle toho nastavuje příznaky (flagy)
      for (let k = 0; k < groups.length; k++) {
        if (lato === "right" && (groups[k].col === (groups[j].col + 1) % c && groups[k].row === groups[j].row % r))
          return true; // kontrola buňky vpravo
        if (lato === "below" && (groups[k].col === groups[j].col % c && groups[k].row === (groups[j].row + 1) % r))
          return true; // kontrola buňky dole
        if (lato === "left") { // kontrola buňky vlevo
          let col = groups[j].col - 1;
          if (col < 0) col = c - 1;
          if ((groups[k].col === col % c && groups[k].row === groups[j].row % r))
            return true;
        }
        if (lato === "above") { // kontrola buňky nahoře
          let row = groups[j].row - 1;
          if (row < 0) row = r - 1;
          if ((groups[k].col === groups[j].col % c && groups[k].row === row % r))
            return true;
        }
      }
      return false;
    }
  
    drawSolution(vectorSol){   //metoda, která zobrazí výsledné řešení na obrazovku
      $(".Solution").show();
      $(".kMapOutput").show();     // přidáno
      $(".truthTable").show();     // přidáno
      $(".nameTab").show();     // přidáno

      $("#sol").html(""); // <<< TADY! Vyčistit obsah před vykreslením nové varianty

  
      let cost=0; 
      if(vectorSol[0]==="0" || vectorSol[0]==="1"){ //případ, kdy je matice celá nulová nebo celá jedničková
        $("#sol").append("<div>"+ vectorSol[0]+ "</div>");
      }
      else{
        const typeSol = this.state.typeSol;
        let s = (typeSol==="SOP")? "+":"·";   //vloží symbol podle zvoleného typu výrazu (SOP nebo POS)
        let cls = (typeSol==="SOP")? "groupSop":"groupPos"; //nastaví CSS třídu podle typu výrazu

        //pole barev, odpovídající barvám skupin, které byly vykresleny – pro snadnou identifikaci
        let color = ["red", "blue", "green", "orange", "#50C878","lightblue","#CD7F32","#ff6699"];  
  
        for(let i=0; i<vectorSol.length; i++){ //prochází celé řešení, rozdělené po skupinách
           //vytvoří div se správnou barvou, odpovídající barvě skupiny
          $("#sol").append("<div id='sol"+i+"' class='"+cls+"' style='background-color: "+color[i]+"'></div>");
          
          for(let j=0; j<vectorSol[i].length; j++){ //prochází jednotlivé znaky jednoho logického výrazu skupiny

            if(vectorSol[i][j]!=="'")
              $("#sol"+i).append(vectorSol[i][j]+" "); //pokud není apostrof, jednoduše přidá znak
            else{
              //pokud je apostrof, neguje následující proměnnou – přidá ji s čárou nahoře
              $("#sol"+i).append("<span style='text-decoration: overline'>"+vectorSol[i][++j]+"</span> ");
            }
            if(vectorSol[i][j]!=="+") cost++;
          }
          if(i!==vectorSol.length-1) $("#sol").append("<div class='plus'> "+s+" </div>"); // přidá zvolený symbol (na začátku metody) podle vybraného typu řešení (SOP nebo POS)
        }
      }
      

      // umístí řešení přibližně na střed pod mapu, aby se při zvyšování počtu prvků nerozbilo rozvržení stránky
      $(".Solution").css("left", parseInt($(".Solution").css("left"))-parseInt($(".Solution").css("width"))/2);
    }
  
    render() {
      // === Lokální proměnné ===
      const values = this.state.squares;
      const typeMap = this.state.typeMap;
      const perm = this.state.perm;
      const typeSol = this.state.typeSol;
      let i = 0;
    
      return (
        <div key={i++}>
    
          {/* === Nadpis stránky === */}
          <div className="title">
            <h1> Minimalizace Karnaughovy mapy </h1>
          </div>
    
          <div className="mapContainer">
          <div className="expressionInput">
  <div className="functionLabel">
    {this.getFunctionLabel()}
  </div>

  {/* Změníme text na základě formátu SOP nebo POS */}
  <label htmlFor="mintermsInput">
    {this.state.EquationType === "Dis" ? "Σm (mintermy):" : "ΠM (maxtermy):"}
  </label>
  <input
  className="inputField"
  type="text"
  value={this.state.inputMinterms}
  onChange={(e) => {
    this.setState({ inputMinterms: e.target.value }, () => {
      this.applyExpressionInputs();
    });
  }}
/>

  <label htmlFor="dontCaresInput">
    {this.state.EquationType === "Dis" ? "+Σd (don't care):" : "+Πd (don't care):"}
  </label>
  <input
  className="inputField"
  type="text"
  value={this.state.inputDontCares}
  onChange={(e) => {
    this.setState({ inputDontCares: e.target.value }, () => {
      this.applyExpressionInputs();
    });
  }}
/>
</div>


  {/* Dva prvky vedle sebe - mapa a ovládací menu */}
  <div className="mapAndOptions">
    <div className="kMap">
      <Map
        squares={values}
        typeMap={typeMap}
        onClick={(i, j) => this.handleClick(i, j)}
        readOnly={false} // výchozí mapa je klikací
        idPrefix="input_"
      />
    </div>

    <OptionButton
      squares={values}
      typeMap={typeMap}
      typeSol={typeSol}
      onClick={() => this.Algorithm(values)}
      setTypeSol={(val) => this.setTypeSol(val)}
      setMatrixSquare={(val) => this.setMatrixSquare(val)}
      setTypeMap={(val) => this.setTypeMap(val)}
      setEquationType={this.setEquationType}
    />
  </div>
</div>
<div className="kMapOutput">
  <Map
    squares={values}
    typeMap={typeMap}
    onClick={(i, j) => this.handleClick(i, j)}
    readOnly={true} // tato už nereaguje na klik
    idPrefix="output_"
  />
</div>

{this.state.allValidSolutions.length > 1 && (
  <div className="solutionSwitcher">
    <button 
      className="btn btn-type" 
      onClick={() => this.prevSolution()} 
      disabled={this.state.currentSolutionIndex === 0}
    >
    Předchozí řešení
    </button>
    <button 
      className="btn btn-type" 
      onClick={() => this.nextSolution()} 
      disabled={this.state.currentSolutionIndex === this.state.allValidSolutions.length - 1}
    >
    Další řešení
    </button>
    <div className="solutionInfo">
      {this.state.currentSolutionIndex + 1} / {this.state.allValidSolutions.length}
    </div>
  </div>
)}


            {/* === Výstup: řešení a logický obvod === */}
            <div className="Solution">
              <div>{typeSol} tvar:</div>
              <div className="sol" id="sol"></div>
    
              <LogicCircuitGo
                expression={this.state.logicExpression}
                type={this.state.typeSol}
              />
            </div>          
            {/* === Pravdivostní tabulka === */}
          <div className="bodyPage" key={i++}>
            <p className="nameTab"> Pravdivostní tabulka </p>
            <div className="truthTable" key={i++}>
            <TruthTable
            squares={values}
            typeMap={typeMap}
            perm={perm}
            />
            </div>
          </div>
    
        </div>
      );
    }
  } 
  
  function isPower(x, y) {
    if (x === 1)
      return (y === 1);
  
    var pow = 1;
    while (pow < y)
      pow *= x;
  
    return (pow === y);
  }
  
  function generateCombinations(array, size) {
    const result = [];
    function helper(start, combo) {
      if (combo.length === size) {
        result.push(combo);
        return;
      }
      for (let i = start; i < array.length; i++) {
        helper(i + 1, combo.concat([array[i]]));
      }
    }
    helper(0, []);
    return result;
  }  

  const customGrayCode4 = [
    [0, 2, 6, 4],
    [1, 3, 7, 5],
    [9, 11, 15, 13],
    [8, 10, 14, 12]
  ];

  function removeSubsets(groups) {
    return groups.filter((group, idx) => {
      if (group.length === 1) {
        return true; // Jednobuněčné skupiny nikdy nemažeme
      }
      return !groups.some((otherGroup, otherIdx) => {
        if (idx === otherIdx) return false;
        return group.every(cell => otherGroup.some(c => c.row === cell.row && c.col === cell.col));
      });
    });
  } 
  
  function filterGroups(groups, squares, typeSol) {
    const importantValue = (typeSol === "SOP") ? 1 : 0;
  
    const coveredCells = new Set();
    // 1. Pokryj všechny buňky většími skupinami
    for (const group of groups) {
      if (group.length > 1) {
        for (const cell of group) {
          coveredCells.add(cell.row + "," + cell.col);
        }
      }
    }
  
    // 2. Vyfiltruj
    return groups.filter(group => {
      if (!group || group.length === 0) return false;
  
      if (group.length > 1) return true; // větší skupiny vždy
  
      const cell = group[0];
      const key = cell.row + "," + cell.col;
      const cellValue = squares[cell.row][cell.col][0];
  
      // Pokud už je pokrytá -> malou skupinu odstraníme
      if (coveredCells.has(key)) {
        return false;
      }
  
      // Pokud není pokrytá, ale je důležitá hodnota (1 nebo 0) -> ponechat
      return cellValue === importantValue;
    });
  } 