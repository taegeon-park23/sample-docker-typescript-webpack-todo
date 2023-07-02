import Didact from './CustomReact'
// import Counter from './components/Counter';
import App from './App';

  const element = Didact.createElement(App, null);
  const container = document.getElementById("root");
  Didact.render(element, container!);
  