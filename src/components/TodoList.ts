import Didact from '../CustomReact';
import TodoItem from './TodoItem';

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

type TodoListProps = {
  todos: Todo[];
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
};

const TodoList = ({ todos, onToggleTodo, onDeleteTodo }: TodoListProps) => {
 
  return Didact.createElement(
    'ul',
    {},
    ...todos.map(todo =>
      Didact.createElement(TodoItem, {
        todo:todo,
        onToggleTodo,
        onDeleteTodo,
      })
    )
  );
};

export default TodoList;