import "./styles/main.scss";

// TodoItem 클래스 정의
class TodoItem {
  private _id: number;
  private content: string;
  private completed: boolean;

  constructor(id: number, content: string) {
    this._id = id;
    this.content = content;
    this.completed = false;
  }

  get id(): number {
    return this._id;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  render(): string {
    return `
      <li class="${this.completed ? 'completed' : ''}">
        <span>${this.content}</span>
        <button onclick="handleToggle(${this.id})">Toggle</button>
        <button onclick="handleDelete(${this.id})">Delete</button>
      </li>
    `;
  }
}

// TodoApp 클래스 정의
class TodoApp {
  private todoList: TodoItem[];
  private idCounter: number;

  constructor() {
    this.todoList = [];
    this.idCounter = 1;
  }

  addTodoItem(content: string) {
    const todoItem = new TodoItem(this.idCounter++, content);
    this.todoList.push(todoItem);
    this.renderTodoList();
  }

  toggleTodoItem(id: number) {
    const todoItem = this.todoList.find(item => item.id === id);
    if (todoItem) {
      todoItem.toggleComplete();
      this.renderTodoList();
    }
  }

  deleteTodoItem(id: number) {
    this.todoList = this.todoList.filter(item => item.id !== id);
    this.renderTodoList();
  }

  renderTodoList() {
    const todoListContainer = document.getElementById('todo-list');
    if (todoListContainer) {
      todoListContainer.innerHTML = this.todoList.map(item => item.render()).join('');
    }
  }
}

// TodoApp 인스턴스 생성
const todoApp = new TodoApp();

// Todo 항목 추가 이벤트 핸들러
(window as any).handleAddTodo = function () {
  const todoInput = document.getElementById('todo-input') as HTMLInputElement;
  const content = todoInput.value.trim();
  if (content !== '') {
    todoApp.addTodoItem(content);
    todoInput.value = '';
  }
};

// Todo 항목 완료 토글 이벤트 핸들러
(window as any).handleToggle = function (id: number) {
  todoApp.toggleTodoItem(id);
};

// Todo 항목 삭제 이벤트 핸들러
(window as any).handleDelete = function (id: number) {
  todoApp.deleteTodoItem(id);
};

// 초기 렌더링
window.addEventListener('DOMContentLoaded', () => {
  todoApp.renderTodoList();
});
