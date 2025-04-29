import React from 'react';
import './css/optionButton.css';

export default class OptionButton extends React.Component {

    render() {
      return (
        <div>
        <div className="optionChoice">
          <div className="mapType">
            <p> Vyberte počet proměnných:</p>
            <div>
              <div className="buttonType"><button className="btn-type" onClick={() => this.props.setTypeMap(2)}>2</button></div>
              <div className="buttonType"><button className="btn-type" onClick={() => this.props.setTypeMap(3)}>3</button></div>
              <div className="buttonType"><button className="btn-type" onClick={() => this.props.setTypeMap(4)}>4</button></div>
            </div>
            <div>
              <p>Funkce</p>
              <div >
                <div className="KonDis"><button className="btn-type" onClick={() => this.props.setEquationType("Dis")}>Disjunktní</button></div>
                <div className="KonDis"><button className="btn-type" onClick={() => this.props.setEquationType("Kon")}>Konjunktní</button></div>
              </div>
            </div>
            <div>
              <p>Nastavit mapu na všechny: </p>
              <div >
                <div className="buttonSettings"><button className="btn-type" onClick={() => this.props.setMatrixSquare(0)}> 0</button></div>
                <div className="buttonSettings"><button className="btn-type" onClick={() => this.props.setMatrixSquare(1)}> 1</button></div>
                <div className="buttonSettings"><button className="btn-type" onClick={() => this.props.setMatrixSquare("X")}> X</button></div>
              </div>
            </div>
            <div>
            <div>
              <p>Tvar: {this.props.typeSol}</p>
              <div >
                <div className="KonDis"><button className="btn-type" onClick={() => this.props.setTypeSol("SOP")}>Součtový</button></div>
                <div className="KonDis"><button className="btn-type" onClick={() => this.props.setTypeSol("POS")}>Součinový</button></div>
              </div>
            </div>
              <p>Výsledek: </p>
              <div>
                <div className="elaborate"><button className="btn-elaborate" id="elabora" onClick={(val) => this.props.onClick(val)}>Zpracuj</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    }
  }