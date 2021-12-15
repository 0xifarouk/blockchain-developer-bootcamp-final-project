
App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof this.window.ethereum !== 'undefined') {
            console.log('MetaMask is available!')
        } else {
            console.log('MetaMask is not available!')
            const loader = $('#loader')
            loader.html("Please install Metamask first!")
            alert("You need to install MetaMask!")
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        await ethereum.request(
            {
                method: 'eth_requestAccounts'
            }
        )
        App.account = ethereum.selectedAddress
        console.log(App.account)
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        // var contract = required("truffle-contract");
        const todoList = await (await fetch('./abi/TodoList.json')).json()
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(window.ethereum)

        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },

    createTask: async () => {
        const content = $('#newTask').val()
        await App.todoList.createTask(content, { from: App.account })
        App.setLoading(true)
        window.location.reload()
    },

    renderTasks: async () => {
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')

        // Render out each task with a new task template
        for (var i = 1; i <= taskCount; i++) {
            // Fetch the task data from the blockchain
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskFinished = task[2]

            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskFinished)
                .on('click', App.toggleFinished)

            // Put the task in the correct list
            if (taskFinished) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            // Show the task
            $newTaskTemplate.show()
        }
    },

    toggleFinished: async (event) => {
        App.setLoading(true)
        const taskId = event.target.name
        await App.todoList.toggleFinished(taskId, { from: App.account })
        window.location.reload()
    },
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})