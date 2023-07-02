import Didact from "../CustomReact/index";


function Counter() {
    const [state, setState] = Didact.useState(1);
    
    return Didact.createElement(
      "h1",
      {
        onClick: () => setState((c: number) => c + 1),
        style: { userSelect: "none" },
      },
      "Count: ",
      state
    );
  }

export default Counter;