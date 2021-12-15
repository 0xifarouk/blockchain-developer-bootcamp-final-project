// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TodoList {
    mapping(uint256 => Task) public tasks;
    uint256 public taskCount = 0;
    address owner = msg.sender;

    event TaskCreated(uint256 id, string content, bool finished);
    event TaskFinished(uint256 id, bool finished);

    constructor() public {
        createTask("Finish final project");
    }

    struct Task {
        uint256 id;
        string content;
        bool finished;
    }

    function createTask(string memory _content) public {
        require(msg.sender == owner, "Not the owner!");
        taskCount = taskCount + 1;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleFinished(uint256 _id) public {
        require(msg.sender == owner, "Not the owner!");
        Task memory _task = tasks[_id];
        _task.finished = !_task.finished;
        tasks[_id] = _task;
        emit TaskFinished(_id, _task.finished);
    }
}
