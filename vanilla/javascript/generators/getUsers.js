function* fetchUsers() {
  yield fetch("https://jsonplaceholder.typicode.com/users")
    .then((resp) => resp.json())
    .then((users) => {
      return users;
    });
}

const usersIt = fetchUsers();
usersIt.next().value.then((resp) => console.log(resp));
