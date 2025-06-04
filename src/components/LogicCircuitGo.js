import React, { useEffect, useRef,  } from 'react';
import * as go from 'gojs';

const LogicCircuitGo = ({ expression, type = "SOP" }) => {
  const diagramRef = useRef(null);
 

  useEffect(() => {
    if (!diagramRef.current) return;

    const oldDiagram = go.Diagram.fromDiv(diagramRef.current);
    if (oldDiagram) oldDiagram.div = null;

    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, diagramRef.current, {
      autoScale: go.Diagram.Uniform,
      contentAlignment: go.Spot.Center,
      "undoManager.isEnabled": false,
      allowMove: false,
      allowSelect: false,
      allowZoom: false,
      layout: $(go.LayeredDigraphLayout, {
        direction: 0,
        layerSpacing: 40,
        columnSpacing: 20
      }),
    });

    // === Node templates ===
    diagram.nodeTemplateMap.add("AND",
      $(go.Node, "Auto",
        $(go.Shape, {
          geometryString: "F M0 0 L0 40 L20 40 Q40 20 20 0 Z",
          fill: "orange", stroke: null
        }),
        $(go.TextBlock, "AND", { margin: 5, stroke: "white", font: "bold 12px sans-serif" })
      )
    );

    diagram.nodeTemplateMap.add("OR",
      $(go.Node, "Auto",
        $(go.Shape, {
          geometryString: "F M0 0 Q30 20 0 40 Q10 20 0 0 Z",
          fill: "lightgreen", stroke: null
        }),
        $(go.TextBlock, "OR", { margin: 5, stroke: "black", font: "bold 12px sans-serif" })
      )
    );

    diagram.nodeTemplateMap.add("NOT",
      $(go.Node, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, {
            geometryString: "F M0 0 L60 30 L0 60 Z",
            fill: "red", stroke: null
          }),
          $(go.TextBlock, "NOT", {
            margin: new go.Margin(10, 20, 10, 0),
            stroke: "white",
            font: "bold 14px sans-serif"
          })
        ),
        $(go.Shape, "Circle", {
          alignment: go.Spot.Right,
          width: 8,
          height: 8,
          fill: "white",
          stroke: "black"
        })
      )
    );

    diagram.nodeTemplateMap.add("LITERAL",
      $(go.Node, "Auto",
        $(go.Shape, "RoundedRectangle", {
          fill: "lightblue", stroke: null
        }),
        $(go.TextBlock, { margin: 6, font: "bold 12px sans-serif" },
          new go.Binding("text", "label"))
      )
    );

    diagram.nodeTemplateMap.add("BULB",
      $(go.Node, "Auto",
        $(go.Shape, "Circle", { fill: "yellow", stroke: "orange", strokeWidth: 2 }),
        $(go.TextBlock, "OUT", { margin: 4, font: "bold 12px sans-serif" })
      )
    );

diagram.nodeTemplateMap.add("CONST",
  $(go.Node, "Auto",
    $(go.Shape, "RoundedRectangle", {
      fill: "#ddd", stroke: null
    }),
    $(go.TextBlock, {
      margin: 6,
      font: "bold 12px sans-serif",
      stroke: "#000"
    },
    new go.Binding("text", "label"))  // ← tady oprava
  )
);



    const normalized = normalizeExpression(expression);
    const { nodeDataArray, linkDataArray } = parseExpression(normalized);
    console.log("Parsed Expression: ", normalized);
    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    return () => diagram.clear();
  }, [expression, type]);

  const normalizeExpression = (expr) => {
    return expr.replace(/'([A-Z])/g, "$1'");
  };

  const parseExpression = (expr) => {
    const nodeDataArray = [];
    const linkDataArray = [];

if (!expr || expr.trim() === "") {
  return { nodeDataArray, linkDataArray };
}

const trimmedExpr = expr.replace(/[\s()]/g, ""); // odstraní mezery a závorky
if (trimmedExpr === "1" || trimmedExpr === "0") {

  nodeDataArray.push(
    { key: "CONST", category: "CONST", label: trimmedExpr },  // ← tady změna: `label` místo `text`
    { key: "BULB", category: "BULB" }
  );
  linkDataArray.push({ from: "CONST", to: "BULB" });

  return { nodeDataArray, linkDataArray };
}



    const terms = expr.split(type === "SOP" ? '+' : '·').map(term => term.trim());
    const mainGate = type === "SOP" ? "OR" : "AND";
    const subGate = type === "SOP" ? "AND" : "OR";

terms.forEach((term, termIndex) => {
  const literals = term.match(/([A-Z]'+|[A-Z])/g);
  if (!literals || literals.length === 0) return;

  // 1 literál → připojit rovnou na hlavní bránu
  if (literals.length === 1) {
    const literal = literals[0];
    const isNegated = literal.endsWith("'");
    const varName = literal.replace("'", "");
    const literalKey = `LIT_${varName}_${termIndex}`;
    const notKey = `NOT_${varName}_${termIndex}`;

    nodeDataArray.push({ key: literalKey, category: "LITERAL", label: varName });

    if (isNegated) {
      nodeDataArray.push({ key: notKey, category: "NOT" });
      linkDataArray.push({ from: literalKey, to: notKey });
      // propojit přímo na hlavní bránu (kterou vytvoříme níže)
      linkDataArray.push({ from: notKey, to: mainGate });
    } else {
      linkDataArray.push({ from: literalKey, to: mainGate });
    }
  }

  // Více literálů → pomocná brána
  else {
    const gateId = `${subGate}${termIndex}`;
    nodeDataArray.push({ key: gateId, category: subGate });

    literals.forEach((literal, i) => {
      const isNegated = literal.endsWith("'");
      const varName = literal.replace("'", "");
      const literalKey = `LIT_${varName}_${gateId}_${i}`;
      const notKey = `NOT_${varName}_${gateId}_${i}`;

      nodeDataArray.push({ key: literalKey, category: "LITERAL", label: varName });

      if (isNegated) {
        nodeDataArray.push({ key: notKey, category: "NOT" });
        linkDataArray.push({ from: literalKey, to: notKey });
        linkDataArray.push({ from: notKey, to: gateId });
      } else {
        linkDataArray.push({ from: literalKey, to: gateId });
      }
    });

    linkDataArray.push({ from: gateId, to: mainGate });
  }
});


    // Napoj výstupy z podbrán na hlavní bránu
    if (terms.length > 1) {
      nodeDataArray.push({ key: mainGate, category: mainGate });
      for (let i = 0; i < terms.length; i++) {
        linkDataArray.push({ from: `${subGate}${i}`, to: mainGate });
      }
    }

    const outputSource = terms.length > 1 ? mainGate : `${subGate}0`;
    nodeDataArray.push({ key: "BULB", category: "BULB" });
    linkDataArray.push({ from: outputSource, to: "BULB" });

    return { nodeDataArray, linkDataArray };
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>Kombinační logický obvod</h3>
        {!expression || expression.trim() === "" || expression.trim() === "0" || expression.trim() === "1" ? (
          <div style={{
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontStyle: 'italic',
            color: '#888'
          }}>
            Není co zobrazit
          </div>
        ) : (
<div
  ref={diagramRef}
  style={{
    backgroundColor: 'white',
    padding: '30px',               // více prostoru okolo diagramu
    width: 'fit-content',
    maxWidth: '100%',              // zabrání přesahu mimo viewport
    minWidth: '1000px',             // větší základní velikost
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    clipPath: 'inset(0 0 0 175px)'

  }}
></div>
        )}
      </div>
    </div>
  );
};

export default LogicCircuitGo;