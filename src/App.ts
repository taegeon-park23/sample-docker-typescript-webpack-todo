import Didact from './CustomReact';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

const App = () => {
  const [todos, setTodos] = Didact.useState<Todo[]>([]);

  const handleAddTodo = (content: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      content,
      completed: false,
    };
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

  const handleToggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(prevTodos => 
        prevTodos.filter(todo => todo.id !== id)
    );
  };

  return Didact.createElement(
    'div',
    {},
    Didact.createElement('h1', {}, 'Todo App'),
    Didact.createElement(TodoForm, { onAddTodo: handleAddTodo }),
    Didact.createElement(TodoList, {
      todos,
      onToggleTodo: handleToggleTodo,
      onDeleteTodo: handleDeleteTodo,
    })
  );
};

export default App;