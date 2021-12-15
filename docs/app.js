
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
        // const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoListJson)
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


const todoListJson = {
    "contractName": "TodoList",
    "abi": [
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "finished",
                    "type": "bool"
                }
            ],
            "name": "TaskCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "finished",
                    "type": "bool"
                }
            ],
            "name": "TaskFinished",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "taskCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "tasks",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "finished",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                }
            ],
            "name": "createTask",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "toggleFinished",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    "metadata": "{\"compiler\":{\"version\":\"0.5.16+commit.9c3226ce\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"content\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"finished\",\"type\":\"bool\"}],\"name\":\"TaskCreated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"finished\",\"type\":\"bool\"}],\"name\":\"TaskFinished\",\"type\":\"event\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"string\",\"name\":\"_content\",\"type\":\"string\"}],\"name\":\"createTask\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"taskCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"tasks\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"content\",\"type\":\"string\"},{\"internalType\":\"bool\",\"name\":\"finished\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_id\",\"type\":\"uint256\"}],\"name\":\"toggleFinished\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"methods\":{}},\"userdoc\":{\"methods\":{}}},\"settings\":{\"compilationTarget\":{\"project:/contracts/TodoList.sol\":\"TodoList\"},\"evmVersion\":\"istanbul\",\"libraries\":{},\"optimizer\":{\"enabled\":false,\"runs\":200},\"remappings\":[]},\"sources\":{\"project:/contracts/TodoList.sol\":{\"keccak256\":\"0xa2596eccb76455a261ff67e289ba935fb723a31a90b23ea15428f846feb3ebba\",\"urls\":[\"bzz-raw://79cbc071ebb071fab4dec684ec34413097bbefa2bf86e9288312b529aaa44b5a\",\"dweb:/ipfs/QmY27f9qajKgzZbiY2RncxH9Hjc6MaVh34Bd7Lgd33vmFo\"]}},\"version\":1}",
    "bytecode": "0x6080604052600060015533600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555034801561005657600080fd5b5061009b6040518060400160405280601481526020017f46696e6973682066696e616c2070726f6a6563740000000000000000000000008152506100a060201b60201c565b610347565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610163576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f4e6f7420746865206f776e65722100000000000000000000000000000000000081525060200191505060405180910390fd5b6001805401600181905550604051806060016040528060015481526020018281526020016000151581525060008060015481526020019081526020016000206000820151816000015560208201518160010190805190602001906101c89291906102a2565b5060408201518160020160006101000a81548160ff0219169083151502179055509050507f05d0fb833127fc08168556d0e7ca9554fc3f6bc843b3b7d2bf1c35aea6bab660600154826000604051808481526020018060200183151515158152602001828103825284818151815260200191508051906020019080838360005b83811015610263578082015181840152602081019050610248565b50505050905090810190601f1680156102905780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a150565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106102e357805160ff1916838001178555610311565b82800160010185558215610311579182015b828111156103105782518255916020019190600101906102f5565b5b50905061031e9190610322565b5090565b61034491905b80821115610340576000816000905550600101610328565b5090565b90565b610853806103566000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063111002aa14610051578063221f6d9d1461010c5780638d9776721461013a578063b6cb58a5146101f3575b600080fd5b61010a6004803603602081101561006757600080fd5b810190808035906020019064010000000081111561008457600080fd5b82018360208201111561009657600080fd5b803590602001918460018302840111640100000000831117156100b857600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610211565b005b6101386004803603602081101561012257600080fd5b8101908080359060200190929190505050610413565b005b6101666004803603602081101561015057600080fd5b8101908080359060200190929190505050610681565b604051808481526020018060200183151515158152602001828103825284818151815260200191508051906020019080838360005b838110156101b657808201518184015260208101905061019b565b50505050905090810190601f1680156101e35780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b6101fb610750565b6040518082815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f4e6f7420746865206f776e65722100000000000000000000000000000000000081525060200191505060405180910390fd5b600180540160018190555060405180606001604052806001548152602001828152602001600015158152506000806001548152602001908152602001600020600082015181600001556020820151816001019080519060200190610339929190610756565b5060408201518160020160006101000a81548160ff0219169083151502179055509050507f05d0fb833127fc08168556d0e7ca9554fc3f6bc843b3b7d2bf1c35aea6bab660600154826000604051808481526020018060200183151515158152602001828103825284818151815260200191508051906020019080838360005b838110156103d45780820151818401526020810190506103b9565b50505050905090810190601f1680156104015780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a150565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104d6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f4e6f7420746865206f776e65722100000000000000000000000000000000000081525060200191505060405180910390fd5b6104de6107d6565b60008083815260200190815260200160002060405180606001604052908160008201548152602001600182018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561059e5780601f106105735761010080835404028352916020019161059e565b820191906000526020600020905b81548152906001019060200180831161058157829003601f168201915b505050505081526020016002820160009054906101000a900460ff161515151581525050905080604001511581604001901515908115158152505080600080848152602001908152602001600020600082015181600001556020820151816001019080519060200190610612929190610756565b5060408201518160020160006101000a81548160ff0219169083151502179055509050507f30e68b2d9517fd20aaa9bce3c19cb9a5e3b56519ed01102f2607735b85deba9282826040015160405180838152602001821515151581526020019250505060405180910390a15050565b6000602052806000526040600020600091509050806000015490806001018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107335780601f1061070857610100808354040283529160200191610733565b820191906000526020600020905b81548152906001019060200180831161071657829003601f168201915b5050505050908060020160009054906101000a900460ff16905083565b60015481565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061079757805160ff19168380011785556107c5565b828001600101855582156107c5579182015b828111156107c45782518255916020019190600101906107a9565b5b5090506107d291906107f9565b5090565b604051806060016040528060008152602001606081526020016000151581525090565b61081b91905b808211156108175760008160009055506001016107ff565b5090565b9056fea265627a7a72315820a4e72fe76d88db64a95ad316d8346499429f6bddff9300ab5c4531f8b7894af464736f6c63430005100032",
    "deployedBytecode": "0x608060405234801561001057600080fd5b506004361061004c5760003560e01c8063111002aa14610051578063221f6d9d1461010c5780638d9776721461013a578063b6cb58a5146101f3575b600080fd5b61010a6004803603602081101561006757600080fd5b810190808035906020019064010000000081111561008457600080fd5b82018360208201111561009657600080fd5b803590602001918460018302840111640100000000831117156100b857600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610211565b005b6101386004803603602081101561012257600080fd5b8101908080359060200190929190505050610413565b005b6101666004803603602081101561015057600080fd5b8101908080359060200190929190505050610681565b604051808481526020018060200183151515158152602001828103825284818151815260200191508051906020019080838360005b838110156101b657808201518184015260208101905061019b565b50505050905090810190601f1680156101e35780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b6101fb610750565b6040518082815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f4e6f7420746865206f776e65722100000000000000000000000000000000000081525060200191505060405180910390fd5b600180540160018190555060405180606001604052806001548152602001828152602001600015158152506000806001548152602001908152602001600020600082015181600001556020820151816001019080519060200190610339929190610756565b5060408201518160020160006101000a81548160ff0219169083151502179055509050507f05d0fb833127fc08168556d0e7ca9554fc3f6bc843b3b7d2bf1c35aea6bab660600154826000604051808481526020018060200183151515158152602001828103825284818151815260200191508051906020019080838360005b838110156103d45780820151818401526020810190506103b9565b50505050905090810190601f1680156104015780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a150565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104d6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f4e6f7420746865206f776e65722100000000000000000000000000000000000081525060200191505060405180910390fd5b6104de6107d6565b60008083815260200190815260200160002060405180606001604052908160008201548152602001600182018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561059e5780601f106105735761010080835404028352916020019161059e565b820191906000526020600020905b81548152906001019060200180831161058157829003601f168201915b505050505081526020016002820160009054906101000a900460ff161515151581525050905080604001511581604001901515908115158152505080600080848152602001908152602001600020600082015181600001556020820151816001019080519060200190610612929190610756565b5060408201518160020160006101000a81548160ff0219169083151502179055509050507f30e68b2d9517fd20aaa9bce3c19cb9a5e3b56519ed01102f2607735b85deba9282826040015160405180838152602001821515151581526020019250505060405180910390a15050565b6000602052806000526040600020600091509050806000015490806001018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107335780601f1061070857610100808354040283529160200191610733565b820191906000526020600020905b81548152906001019060200180831161071657829003601f168201915b5050505050908060020160009054906101000a900460ff16905083565b60015481565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061079757805160ff19168380011785556107c5565b828001600101855582156107c5579182015b828111156107c45782518255916020019190600101906107a9565b5b5090506107d291906107f9565b5090565b604051806060016040528060008152602001606081526020016000151581525090565b61081b91905b808211156108175760008160009055506001016107ff565b5090565b9056fea265627a7a72315820a4e72fe76d88db64a95ad316d8346499429f6bddff9300ab5c4531f8b7894af464736f6c63430005100032",
    "sourceMap": "66:959:0:-;;;160:1;133:28;;183:10;167:26;;;;;;;;;;;;;;;;;;;;318:72;8:9:-1;5:2;;;30:1;27;20:12;5:2;318:72:0;349:34;;;;;;;;;;;;;;;;;;:10;;;:34;;:::i;:::-;66:959;;488:264;571:5;;;;;;;;;;;557:19;;:10;:19;;;549:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;629:1;617:9;;:13;605:9;:25;;;;659:32;;;;;;;;664:9;;659:32;;;;675:8;659:32;;;;685:5;659:32;;;;;640:5;:16;646:9;;640:16;;;;;;;;;;;:51;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;706:39;718:9;;729:8;739:5;706:39;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;706:39:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;488:264;:::o;66:959::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;",
    "deployedSourceMap": "66:959:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;66:959:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;488:264;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;488:264:0;;;;;;;;;;21:11:-1;8;5:28;2:2;;;46:1;43;36:12;2:2;488:264:0;;35:9:-1;28:4;12:14;8:25;5:40;2:2;;;58:1;55;48:12;2:2;488:264:0;;;;;;100:9:-1;95:1;81:12;77:20;67:8;63:35;60:50;39:11;25:12;22:29;11:107;8:2;;;131:1;128;121:12;8:2;488:264:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30:3:-1;22:6;14;1:33;99:1;93:3;85:6;81:16;74:27;137:4;133:9;126:4;121:3;117:14;113:30;106:37;;169:3;161:6;157:16;147:26;;488:264:0;;;;;;;;;;;;;;;:::i;:::-;;758:265;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;758:265:0;;;;;;;;;;;;;;;;;:::i;:::-;;90:37;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;90:37:0;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;90:37:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;133:28;;;:::i;:::-;;;;;;;;;;;;;;;;;;;488:264;571:5;;;;;;;;;;;557:19;;:10;:19;;;549:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;629:1;617:9;;:13;605:9;:25;;;;659:32;;;;;;;;664:9;;659:32;;;;675:8;659:32;;;;685:5;659:32;;;;;640:5;:16;646:9;;640:16;;;;;;;;;;;:51;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;706:39;718:9;;729:8;739:5;706:39;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;706:39:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;488:264;:::o;758:265::-;834:5;;;;;;;;;;;820:19;;:10;:19;;;812:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;868:17;;:::i;:::-;888:5;:10;894:3;888:10;;;;;;;;;;;868:30;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;926:5;:14;;;925:15;908:5;:14;;:32;;;;;;;;;;;963:5;950;:10;956:3;950:10;;;;;;;;;;;:18;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;983:33;996:3;1001:5;:14;;;983:33;;;;;;;;;;;;;;;;;;;;;;;;;;;;758:265;;:::o;90:37::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;133:28::-;;;;:::o;66:959::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o",
    "source": "// SPDX-License-Identifier: MIT\npragma solidity >=0.4.22 <0.9.0;\n\ncontract TodoList {\n    mapping(uint256 => Task) public tasks;\n    uint256 public taskCount = 0;\n    address owner = msg.sender;\n\n    event TaskCreated(uint256 id, string content, bool finished);\n    event TaskFinished(uint256 id, bool finished);\n\n    constructor() public {\n        createTask(\"Finish final project\");\n    }\n\n    struct Task {\n        uint256 id;\n        string content;\n        bool finished;\n    }\n\n    function createTask(string memory _content) public {\n        require(msg.sender == owner, \"Not the owner!\");\n        taskCount = taskCount + 1;\n        tasks[taskCount] = Task(taskCount, _content, false);\n        emit TaskCreated(taskCount, _content, false);\n    }\n\n    function toggleFinished(uint256 _id) public {\n        require(msg.sender == owner, \"Not the owner!\");\n        Task memory _task = tasks[_id];\n        _task.finished = !_task.finished;\n        tasks[_id] = _task;\n        emit TaskFinished(_id, _task.finished);\n    }\n}\n",
    "sourcePath": "/Users/farouk/Desktop/Blockchain/FinalProject-TodoApp/contracts/TodoList.sol",
    "ast": {
        "absolutePath": "project:/contracts/TodoList.sol",
        "exportedSymbols": {
            "TodoList": [
                118
            ]
        },
        "id": 119,
        "nodeType": "SourceUnit",
        "nodes": [
            {
                "id": 1,
                "literals": [
                    "solidity",
                    ">=",
                    "0.4",
                    ".22",
                    "<",
                    "0.9",
                    ".0"
                ],
                "nodeType": "PragmaDirective",
                "src": "32:32:0"
            },
            {
                "baseContracts": [],
                "contractDependencies": [],
                "contractKind": "contract",
                "documentation": null,
                "fullyImplemented": true,
                "id": 118,
                "linearizedBaseContracts": [
                    118
                ],
                "name": "TodoList",
                "nodeType": "ContractDefinition",
                "nodes": [
                    {
                        "constant": false,
                        "id": 5,
                        "name": "tasks",
                        "nodeType": "VariableDeclaration",
                        "scope": 118,
                        "src": "90:37:0",
                        "stateVariable": true,
                        "storageLocation": "default",
                        "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_uint256_$_t_struct$_Task_$41_storage_$",
                            "typeString": "mapping(uint256 => struct TodoList.Task)"
                        },
                        "typeName": {
                            "id": 4,
                            "keyType": {
                                "id": 2,
                                "name": "uint256",
                                "nodeType": "ElementaryTypeName",
                                "src": "98:7:0",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_uint256",
                                    "typeString": "uint256"
                                }
                            },
                            "nodeType": "Mapping",
                            "src": "90:24:0",
                            "typeDescriptions": {
                                "typeIdentifier": "t_mapping$_t_uint256_$_t_struct$_Task_$41_storage_$",
                                "typeString": "mapping(uint256 => struct TodoList.Task)"
                            },
                            "valueType": {
                                "contractScope": null,
                                "id": 3,
                                "name": "Task",
                                "nodeType": "UserDefinedTypeName",
                                "referencedDeclaration": 41,
                                "src": "109:4:0",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_struct$_Task_$41_storage_ptr",
                                    "typeString": "struct TodoList.Task"
                                }
                            }
                        },
                        "value": null,
                        "visibility": "public"
                    },
                    {
                        "constant": false,
                        "id": 8,
                        "name": "taskCount",
                        "nodeType": "VariableDeclaration",
                        "scope": 118,
                        "src": "133:28:0",
                        "stateVariable": true,
                        "storageLocation": "default",
                        "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                        },
                        "typeName": {
                            "id": 6,
                            "name": "uint256",
                            "nodeType": "ElementaryTypeName",
                            "src": "133:7:0",
                            "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                            }
                        },
                        "value": {
                            "argumentTypes": null,
                            "hexValue": "30",
                            "id": 7,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "160:1:0",
                            "subdenomination": null,
                            "typeDescriptions": {
                                "typeIdentifier": "t_rational_0_by_1",
                                "typeString": "int_const 0"
                            },
                            "value": "0"
                        },
                        "visibility": "public"
                    },
                    {
                        "constant": false,
                        "id": 12,
                        "name": "owner",
                        "nodeType": "VariableDeclaration",
                        "scope": 118,
                        "src": "167:26:0",
                        "stateVariable": true,
                        "storageLocation": "default",
                        "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                        },
                        "typeName": {
                            "id": 9,
                            "name": "address",
                            "nodeType": "ElementaryTypeName",
                            "src": "167:7:0",
                            "stateMutability": "nonpayable",
                            "typeDescriptions": {
                                "typeIdentifier": "t_address",
                                "typeString": "address"
                            }
                        },
                        "value": {
                            "argumentTypes": null,
                            "expression": {
                                "argumentTypes": null,
                                "id": 10,
                                "name": "msg",
                                "nodeType": "Identifier",
                                "overloadedDeclarations": [],
                                "referencedDeclaration": 133,
                                "src": "183:3:0",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_magic_message",
                                    "typeString": "msg"
                                }
                            },
                            "id": 11,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "sender",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": null,
                            "src": "183:10:0",
                            "typeDescriptions": {
                                "typeIdentifier": "t_address_payable",
                                "typeString": "address payable"
                            }
                        },
                        "visibility": "internal"
                    },
                    {
                        "anonymous": false,
                        "documentation": null,
                        "id": 20,
                        "name": "TaskCreated",
                        "nodeType": "EventDefinition",
                        "parameters": {
                            "id": 19,
                            "nodeType": "ParameterList",
                            "parameters": [
                                {
                                    "constant": false,
                                    "id": 14,
                                    "indexed": false,
                                    "name": "id",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 20,
                                    "src": "218:10:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_uint256",
                                        "typeString": "uint256"
                                    },
                                    "typeName": {
                                        "id": 13,
                                        "name": "uint256",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "218:7:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_uint256",
                                            "typeString": "uint256"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                },
                                {
                                    "constant": false,
                                    "id": 16,
                                    "indexed": false,
                                    "name": "content",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 20,
                                    "src": "230:14:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_string_memory_ptr",
                                        "typeString": "string"
                                    },
                                    "typeName": {
                                        "id": 15,
                                        "name": "string",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "230:6:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_string_storage_ptr",
                                            "typeString": "string"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                },
                                {
                                    "constant": false,
                                    "id": 18,
                                    "indexed": false,
                                    "name": "finished",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 20,
                                    "src": "246:13:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_bool",
                                        "typeString": "bool"
                                    },
                                    "typeName": {
                                        "id": 17,
                                        "name": "bool",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "246:4:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_bool",
                                            "typeString": "bool"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                }
                            ],
                            "src": "217:43:0"
                        },
                        "src": "200:61:0"
                    },
                    {
                        "anonymous": false,
                        "documentation": null,
                        "id": 26,
                        "name": "TaskFinished",
                        "nodeType": "EventDefinition",
                        "parameters": {
                            "id": 25,
                            "nodeType": "ParameterList",
                            "parameters": [
                                {
                                    "constant": false,
                                    "id": 22,
                                    "indexed": false,
                                    "name": "id",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 26,
                                    "src": "285:10:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_uint256",
                                        "typeString": "uint256"
                                    },
                                    "typeName": {
                                        "id": 21,
                                        "name": "uint256",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "285:7:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_uint256",
                                            "typeString": "uint256"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                },
                                {
                                    "constant": false,
                                    "id": 24,
                                    "indexed": false,
                                    "name": "finished",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 26,
                                    "src": "297:13:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_bool",
                                        "typeString": "bool"
                                    },
                                    "typeName": {
                                        "id": 23,
                                        "name": "bool",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "297:4:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_bool",
                                            "typeString": "bool"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                }
                            ],
                            "src": "284:27:0"
                        },
                        "src": "266:46:0"
                    },
                    {
                        "body": {
                            "id": 33,
                            "nodeType": "Block",
                            "src": "339:51:0",
                            "statements": [
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "arguments": [
                                            {
                                                "argumentTypes": null,
                                                "hexValue": "46696e6973682066696e616c2070726f6a656374",
                                                "id": 30,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": true,
                                                "kind": "string",
                                                "lValueRequested": false,
                                                "nodeType": "Literal",
                                                "src": "360:22:0",
                                                "subdenomination": null,
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_stringliteral_6bdf4066905b4b6eff08c677de4873c88b6b5bfb937c18b734b059275ce526a1",
                                                    "typeString": "literal_string \"Finish final project\""
                                                },
                                                "value": "Finish final project"
                                            }
                                        ],
                                        "expression": {
                                            "argumentTypes": [
                                                {
                                                    "typeIdentifier": "t_stringliteral_6bdf4066905b4b6eff08c677de4873c88b6b5bfb937c18b734b059275ce526a1",
                                                    "typeString": "literal_string \"Finish final project\""
                                                }
                                            ],
                                            "id": 29,
                                            "name": "createTask",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 77,
                                            "src": "349:10:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_function_internal_nonpayable$_t_string_memory_ptr_$returns$__$",
                                                "typeString": "function (string memory)"
                                            }
                                        },
                                        "id": 31,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "kind": "functionCall",
                                        "lValueRequested": false,
                                        "names": [],
                                        "nodeType": "FunctionCall",
                                        "src": "349:34:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_tuple$__$",
                                            "typeString": "tuple()"
                                        }
                                    },
                                    "id": 32,
                                    "nodeType": "ExpressionStatement",
                                    "src": "349:34:0"
                                }
                            ]
                        },
                        "documentation": null,
                        "id": 34,
                        "implemented": true,
                        "kind": "constructor",
                        "modifiers": [],
                        "name": "",
                        "nodeType": "FunctionDefinition",
                        "parameters": {
                            "id": 27,
                            "nodeType": "ParameterList",
                            "parameters": [],
                            "src": "329:2:0"
                        },
                        "returnParameters": {
                            "id": 28,
                            "nodeType": "ParameterList",
                            "parameters": [],
                            "src": "339:0:0"
                        },
                        "scope": 118,
                        "src": "318:72:0",
                        "stateMutability": "nonpayable",
                        "superFunction": null,
                        "visibility": "public"
                    },
                    {
                        "canonicalName": "TodoList.Task",
                        "id": 41,
                        "members": [
                            {
                                "constant": false,
                                "id": 36,
                                "name": "id",
                                "nodeType": "VariableDeclaration",
                                "scope": 41,
                                "src": "418:10:0",
                                "stateVariable": false,
                                "storageLocation": "default",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_uint256",
                                    "typeString": "uint256"
                                },
                                "typeName": {
                                    "id": 35,
                                    "name": "uint256",
                                    "nodeType": "ElementaryTypeName",
                                    "src": "418:7:0",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_uint256",
                                        "typeString": "uint256"
                                    }
                                },
                                "value": null,
                                "visibility": "internal"
                            },
                            {
                                "constant": false,
                                "id": 38,
                                "name": "content",
                                "nodeType": "VariableDeclaration",
                                "scope": 41,
                                "src": "438:14:0",
                                "stateVariable": false,
                                "storageLocation": "default",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_string_storage_ptr",
                                    "typeString": "string"
                                },
                                "typeName": {
                                    "id": 37,
                                    "name": "string",
                                    "nodeType": "ElementaryTypeName",
                                    "src": "438:6:0",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_string_storage_ptr",
                                        "typeString": "string"
                                    }
                                },
                                "value": null,
                                "visibility": "internal"
                            },
                            {
                                "constant": false,
                                "id": 40,
                                "name": "finished",
                                "nodeType": "VariableDeclaration",
                                "scope": 41,
                                "src": "462:13:0",
                                "stateVariable": false,
                                "storageLocation": "default",
                                "typeDescriptions": {
                                    "typeIdentifier": "t_bool",
                                    "typeString": "bool"
                                },
                                "typeName": {
                                    "id": 39,
                                    "name": "bool",
                                    "nodeType": "ElementaryTypeName",
                                    "src": "462:4:0",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_bool",
                                        "typeString": "bool"
                                    }
                                },
                                "value": null,
                                "visibility": "internal"
                            }
                        ],
                        "name": "Task",
                        "nodeType": "StructDefinition",
                        "scope": 118,
                        "src": "396:86:0",
                        "visibility": "public"
                    },
                    {
                        "body": {
                            "id": 76,
                            "nodeType": "Block",
                            "src": "539:213:0",
                            "statements": [
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "arguments": [
                                            {
                                                "argumentTypes": null,
                                                "commonType": {
                                                    "typeIdentifier": "t_address",
                                                    "typeString": "address"
                                                },
                                                "id": 50,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": false,
                                                "lValueRequested": false,
                                                "leftExpression": {
                                                    "argumentTypes": null,
                                                    "expression": {
                                                        "argumentTypes": null,
                                                        "id": 47,
                                                        "name": "msg",
                                                        "nodeType": "Identifier",
                                                        "overloadedDeclarations": [],
                                                        "referencedDeclaration": 133,
                                                        "src": "557:3:0",
                                                        "typeDescriptions": {
                                                            "typeIdentifier": "t_magic_message",
                                                            "typeString": "msg"
                                                        }
                                                    },
                                                    "id": 48,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "memberName": "sender",
                                                    "nodeType": "MemberAccess",
                                                    "referencedDeclaration": null,
                                                    "src": "557:10:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_address_payable",
                                                        "typeString": "address payable"
                                                    }
                                                },
                                                "nodeType": "BinaryOperation",
                                                "operator": "==",
                                                "rightExpression": {
                                                    "argumentTypes": null,
                                                    "id": 49,
                                                    "name": "owner",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 12,
                                                    "src": "571:5:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_address",
                                                        "typeString": "address"
                                                    }
                                                },
                                                "src": "557:19:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            },
                                            {
                                                "argumentTypes": null,
                                                "hexValue": "4e6f7420746865206f776e657221",
                                                "id": 51,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": true,
                                                "kind": "string",
                                                "lValueRequested": false,
                                                "nodeType": "Literal",
                                                "src": "578:16:0",
                                                "subdenomination": null,
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                    "typeString": "literal_string \"Not the owner!\""
                                                },
                                                "value": "Not the owner!"
                                            }
                                        ],
                                        "expression": {
                                            "argumentTypes": [
                                                {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                },
                                                {
                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                    "typeString": "literal_string \"Not the owner!\""
                                                }
                                            ],
                                            "id": 46,
                                            "name": "require",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [
                                                136,
                                                137
                                            ],
                                            "referencedDeclaration": 137,
                                            "src": "549:7:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                                                "typeString": "function (bool,string memory) pure"
                                            }
                                        },
                                        "id": 52,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "kind": "functionCall",
                                        "lValueRequested": false,
                                        "names": [],
                                        "nodeType": "FunctionCall",
                                        "src": "549:46:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_tuple$__$",
                                            "typeString": "tuple()"
                                        }
                                    },
                                    "id": 53,
                                    "nodeType": "ExpressionStatement",
                                    "src": "549:46:0"
                                },
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "id": 58,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "lValueRequested": false,
                                        "leftHandSide": {
                                            "argumentTypes": null,
                                            "id": 54,
                                            "name": "taskCount",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 8,
                                            "src": "605:9:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_uint256",
                                                "typeString": "uint256"
                                            }
                                        },
                                        "nodeType": "Assignment",
                                        "operator": "=",
                                        "rightHandSide": {
                                            "argumentTypes": null,
                                            "commonType": {
                                                "typeIdentifier": "t_uint256",
                                                "typeString": "uint256"
                                            },
                                            "id": 57,
                                            "isConstant": false,
                                            "isLValue": false,
                                            "isPure": false,
                                            "lValueRequested": false,
                                            "leftExpression": {
                                                "argumentTypes": null,
                                                "id": 55,
                                                "name": "taskCount",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 8,
                                                "src": "617:9:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                }
                                            },
                                            "nodeType": "BinaryOperation",
                                            "operator": "+",
                                            "rightExpression": {
                                                "argumentTypes": null,
                                                "hexValue": "31",
                                                "id": 56,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": true,
                                                "kind": "number",
                                                "lValueRequested": false,
                                                "nodeType": "Literal",
                                                "src": "629:1:0",
                                                "subdenomination": null,
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_rational_1_by_1",
                                                    "typeString": "int_const 1"
                                                },
                                                "value": "1"
                                            },
                                            "src": "617:13:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_uint256",
                                                "typeString": "uint256"
                                            }
                                        },
                                        "src": "605:25:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_uint256",
                                            "typeString": "uint256"
                                        }
                                    },
                                    "id": 59,
                                    "nodeType": "ExpressionStatement",
                                    "src": "605:25:0"
                                },
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "id": 68,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "lValueRequested": false,
                                        "leftHandSide": {
                                            "argumentTypes": null,
                                            "baseExpression": {
                                                "argumentTypes": null,
                                                "id": 60,
                                                "name": "tasks",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 5,
                                                "src": "640:5:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_mapping$_t_uint256_$_t_struct$_Task_$41_storage_$",
                                                    "typeString": "mapping(uint256 => struct TodoList.Task storage ref)"
                                                }
                                            },
                                            "id": 62,
                                            "indexExpression": {
                                                "argumentTypes": null,
                                                "id": 61,
                                                "name": "taskCount",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 8,
                                                "src": "646:9:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                }
                                            },
                                            "isConstant": false,
                                            "isLValue": true,
                                            "isPure": false,
                                            "lValueRequested": true,
                                            "nodeType": "IndexAccess",
                                            "src": "640:16:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_struct$_Task_$41_storage",
                                                "typeString": "struct TodoList.Task storage ref"
                                            }
                                        },
                                        "nodeType": "Assignment",
                                        "operator": "=",
                                        "rightHandSide": {
                                            "argumentTypes": null,
                                            "arguments": [
                                                {
                                                    "argumentTypes": null,
                                                    "id": 64,
                                                    "name": "taskCount",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 8,
                                                    "src": "664:9:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_uint256",
                                                        "typeString": "uint256"
                                                    }
                                                },
                                                {
                                                    "argumentTypes": null,
                                                    "id": 65,
                                                    "name": "_content",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 43,
                                                    "src": "675:8:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_string_memory_ptr",
                                                        "typeString": "string memory"
                                                    }
                                                },
                                                {
                                                    "argumentTypes": null,
                                                    "hexValue": "66616c7365",
                                                    "id": 66,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": true,
                                                    "kind": "bool",
                                                    "lValueRequested": false,
                                                    "nodeType": "Literal",
                                                    "src": "685:5:0",
                                                    "subdenomination": null,
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_bool",
                                                        "typeString": "bool"
                                                    },
                                                    "value": "false"
                                                }
                                            ],
                                            "expression": {
                                                "argumentTypes": [
                                                    {
                                                        "typeIdentifier": "t_uint256",
                                                        "typeString": "uint256"
                                                    },
                                                    {
                                                        "typeIdentifier": "t_string_memory_ptr",
                                                        "typeString": "string memory"
                                                    },
                                                    {
                                                        "typeIdentifier": "t_bool",
                                                        "typeString": "bool"
                                                    }
                                                ],
                                                "id": 63,
                                                "name": "Task",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 41,
                                                "src": "659:4:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_type$_t_struct$_Task_$41_storage_ptr_$",
                                                    "typeString": "type(struct TodoList.Task storage pointer)"
                                                }
                                            },
                                            "id": 67,
                                            "isConstant": false,
                                            "isLValue": false,
                                            "isPure": false,
                                            "kind": "structConstructorCall",
                                            "lValueRequested": false,
                                            "names": [],
                                            "nodeType": "FunctionCall",
                                            "src": "659:32:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_struct$_Task_$41_memory",
                                                "typeString": "struct TodoList.Task memory"
                                            }
                                        },
                                        "src": "640:51:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_struct$_Task_$41_storage",
                                            "typeString": "struct TodoList.Task storage ref"
                                        }
                                    },
                                    "id": 69,
                                    "nodeType": "ExpressionStatement",
                                    "src": "640:51:0"
                                },
                                {
                                    "eventCall": {
                                        "argumentTypes": null,
                                        "arguments": [
                                            {
                                                "argumentTypes": null,
                                                "id": 71,
                                                "name": "taskCount",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 8,
                                                "src": "718:9:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                }
                                            },
                                            {
                                                "argumentTypes": null,
                                                "id": 72,
                                                "name": "_content",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 43,
                                                "src": "729:8:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_string_memory_ptr",
                                                    "typeString": "string memory"
                                                }
                                            },
                                            {
                                                "argumentTypes": null,
                                                "hexValue": "66616c7365",
                                                "id": 73,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": true,
                                                "kind": "bool",
                                                "lValueRequested": false,
                                                "nodeType": "Literal",
                                                "src": "739:5:0",
                                                "subdenomination": null,
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                },
                                                "value": "false"
                                            }
                                        ],
                                        "expression": {
                                            "argumentTypes": [
                                                {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                },
                                                {
                                                    "typeIdentifier": "t_string_memory_ptr",
                                                    "typeString": "string memory"
                                                },
                                                {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            ],
                                            "id": 70,
                                            "name": "TaskCreated",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 20,
                                            "src": "706:11:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_function_event_nonpayable$_t_uint256_$_t_string_memory_ptr_$_t_bool_$returns$__$",
                                                "typeString": "function (uint256,string memory,bool)"
                                            }
                                        },
                                        "id": 74,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "kind": "functionCall",
                                        "lValueRequested": false,
                                        "names": [],
                                        "nodeType": "FunctionCall",
                                        "src": "706:39:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_tuple$__$",
                                            "typeString": "tuple()"
                                        }
                                    },
                                    "id": 75,
                                    "nodeType": "EmitStatement",
                                    "src": "701:44:0"
                                }
                            ]
                        },
                        "documentation": null,
                        "id": 77,
                        "implemented": true,
                        "kind": "function",
                        "modifiers": [],
                        "name": "createTask",
                        "nodeType": "FunctionDefinition",
                        "parameters": {
                            "id": 44,
                            "nodeType": "ParameterList",
                            "parameters": [
                                {
                                    "constant": false,
                                    "id": 43,
                                    "name": "_content",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 77,
                                    "src": "508:22:0",
                                    "stateVariable": false,
                                    "storageLocation": "memory",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_string_memory_ptr",
                                        "typeString": "string"
                                    },
                                    "typeName": {
                                        "id": 42,
                                        "name": "string",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "508:6:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_string_storage_ptr",
                                            "typeString": "string"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                }
                            ],
                            "src": "507:24:0"
                        },
                        "returnParameters": {
                            "id": 45,
                            "nodeType": "ParameterList",
                            "parameters": [],
                            "src": "539:0:0"
                        },
                        "scope": 118,
                        "src": "488:264:0",
                        "stateMutability": "nonpayable",
                        "superFunction": null,
                        "visibility": "public"
                    },
                    {
                        "body": {
                            "id": 116,
                            "nodeType": "Block",
                            "src": "802:221:0",
                            "statements": [
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "arguments": [
                                            {
                                                "argumentTypes": null,
                                                "commonType": {
                                                    "typeIdentifier": "t_address",
                                                    "typeString": "address"
                                                },
                                                "id": 86,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": false,
                                                "lValueRequested": false,
                                                "leftExpression": {
                                                    "argumentTypes": null,
                                                    "expression": {
                                                        "argumentTypes": null,
                                                        "id": 83,
                                                        "name": "msg",
                                                        "nodeType": "Identifier",
                                                        "overloadedDeclarations": [],
                                                        "referencedDeclaration": 133,
                                                        "src": "820:3:0",
                                                        "typeDescriptions": {
                                                            "typeIdentifier": "t_magic_message",
                                                            "typeString": "msg"
                                                        }
                                                    },
                                                    "id": 84,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "memberName": "sender",
                                                    "nodeType": "MemberAccess",
                                                    "referencedDeclaration": null,
                                                    "src": "820:10:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_address_payable",
                                                        "typeString": "address payable"
                                                    }
                                                },
                                                "nodeType": "BinaryOperation",
                                                "operator": "==",
                                                "rightExpression": {
                                                    "argumentTypes": null,
                                                    "id": 85,
                                                    "name": "owner",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 12,
                                                    "src": "834:5:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_address",
                                                        "typeString": "address"
                                                    }
                                                },
                                                "src": "820:19:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            },
                                            {
                                                "argumentTypes": null,
                                                "hexValue": "4e6f7420746865206f776e657221",
                                                "id": 87,
                                                "isConstant": false,
                                                "isLValue": false,
                                                "isPure": true,
                                                "kind": "string",
                                                "lValueRequested": false,
                                                "nodeType": "Literal",
                                                "src": "841:16:0",
                                                "subdenomination": null,
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                    "typeString": "literal_string \"Not the owner!\""
                                                },
                                                "value": "Not the owner!"
                                            }
                                        ],
                                        "expression": {
                                            "argumentTypes": [
                                                {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                },
                                                {
                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                    "typeString": "literal_string \"Not the owner!\""
                                                }
                                            ],
                                            "id": 82,
                                            "name": "require",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [
                                                136,
                                                137
                                            ],
                                            "referencedDeclaration": 137,
                                            "src": "812:7:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                                                "typeString": "function (bool,string memory) pure"
                                            }
                                        },
                                        "id": 88,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "kind": "functionCall",
                                        "lValueRequested": false,
                                        "names": [],
                                        "nodeType": "FunctionCall",
                                        "src": "812:46:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_tuple$__$",
                                            "typeString": "tuple()"
                                        }
                                    },
                                    "id": 89,
                                    "nodeType": "ExpressionStatement",
                                    "src": "812:46:0"
                                },
                                {
                                    "assignments": [
                                        91
                                    ],
                                    "declarations": [
                                        {
                                            "constant": false,
                                            "id": 91,
                                            "name": "_task",
                                            "nodeType": "VariableDeclaration",
                                            "scope": 116,
                                            "src": "868:17:0",
                                            "stateVariable": false,
                                            "storageLocation": "memory",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_struct$_Task_$41_memory_ptr",
                                                "typeString": "struct TodoList.Task"
                                            },
                                            "typeName": {
                                                "contractScope": null,
                                                "id": 90,
                                                "name": "Task",
                                                "nodeType": "UserDefinedTypeName",
                                                "referencedDeclaration": 41,
                                                "src": "868:4:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_struct$_Task_$41_storage_ptr",
                                                    "typeString": "struct TodoList.Task"
                                                }
                                            },
                                            "value": null,
                                            "visibility": "internal"
                                        }
                                    ],
                                    "id": 95,
                                    "initialValue": {
                                        "argumentTypes": null,
                                        "baseExpression": {
                                            "argumentTypes": null,
                                            "id": 92,
                                            "name": "tasks",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 5,
                                            "src": "888:5:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_mapping$_t_uint256_$_t_struct$_Task_$41_storage_$",
                                                "typeString": "mapping(uint256 => struct TodoList.Task storage ref)"
                                            }
                                        },
                                        "id": 94,
                                        "indexExpression": {
                                            "argumentTypes": null,
                                            "id": 93,
                                            "name": "_id",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 79,
                                            "src": "894:3:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_uint256",
                                                "typeString": "uint256"
                                            }
                                        },
                                        "isConstant": false,
                                        "isLValue": true,
                                        "isPure": false,
                                        "lValueRequested": false,
                                        "nodeType": "IndexAccess",
                                        "src": "888:10:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_struct$_Task_$41_storage",
                                            "typeString": "struct TodoList.Task storage ref"
                                        }
                                    },
                                    "nodeType": "VariableDeclarationStatement",
                                    "src": "868:30:0"
                                },
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "id": 102,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "lValueRequested": false,
                                        "leftHandSide": {
                                            "argumentTypes": null,
                                            "expression": {
                                                "argumentTypes": null,
                                                "id": 96,
                                                "name": "_task",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 91,
                                                "src": "908:5:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_struct$_Task_$41_memory_ptr",
                                                    "typeString": "struct TodoList.Task memory"
                                                }
                                            },
                                            "id": 98,
                                            "isConstant": false,
                                            "isLValue": true,
                                            "isPure": false,
                                            "lValueRequested": true,
                                            "memberName": "finished",
                                            "nodeType": "MemberAccess",
                                            "referencedDeclaration": 40,
                                            "src": "908:14:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_bool",
                                                "typeString": "bool"
                                            }
                                        },
                                        "nodeType": "Assignment",
                                        "operator": "=",
                                        "rightHandSide": {
                                            "argumentTypes": null,
                                            "id": 101,
                                            "isConstant": false,
                                            "isLValue": false,
                                            "isPure": false,
                                            "lValueRequested": false,
                                            "nodeType": "UnaryOperation",
                                            "operator": "!",
                                            "prefix": true,
                                            "src": "925:15:0",
                                            "subExpression": {
                                                "argumentTypes": null,
                                                "expression": {
                                                    "argumentTypes": null,
                                                    "id": 99,
                                                    "name": "_task",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 91,
                                                    "src": "926:5:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_struct$_Task_$41_memory_ptr",
                                                        "typeString": "struct TodoList.Task memory"
                                                    }
                                                },
                                                "id": 100,
                                                "isConstant": false,
                                                "isLValue": true,
                                                "isPure": false,
                                                "lValueRequested": false,
                                                "memberName": "finished",
                                                "nodeType": "MemberAccess",
                                                "referencedDeclaration": 40,
                                                "src": "926:14:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            },
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_bool",
                                                "typeString": "bool"
                                            }
                                        },
                                        "src": "908:32:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_bool",
                                            "typeString": "bool"
                                        }
                                    },
                                    "id": 103,
                                    "nodeType": "ExpressionStatement",
                                    "src": "908:32:0"
                                },
                                {
                                    "expression": {
                                        "argumentTypes": null,
                                        "id": 108,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "lValueRequested": false,
                                        "leftHandSide": {
                                            "argumentTypes": null,
                                            "baseExpression": {
                                                "argumentTypes": null,
                                                "id": 104,
                                                "name": "tasks",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 5,
                                                "src": "950:5:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_mapping$_t_uint256_$_t_struct$_Task_$41_storage_$",
                                                    "typeString": "mapping(uint256 => struct TodoList.Task storage ref)"
                                                }
                                            },
                                            "id": 106,
                                            "indexExpression": {
                                                "argumentTypes": null,
                                                "id": 105,
                                                "name": "_id",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 79,
                                                "src": "956:3:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                }
                                            },
                                            "isConstant": false,
                                            "isLValue": true,
                                            "isPure": false,
                                            "lValueRequested": true,
                                            "nodeType": "IndexAccess",
                                            "src": "950:10:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_struct$_Task_$41_storage",
                                                "typeString": "struct TodoList.Task storage ref"
                                            }
                                        },
                                        "nodeType": "Assignment",
                                        "operator": "=",
                                        "rightHandSide": {
                                            "argumentTypes": null,
                                            "id": 107,
                                            "name": "_task",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 91,
                                            "src": "963:5:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_struct$_Task_$41_memory_ptr",
                                                "typeString": "struct TodoList.Task memory"
                                            }
                                        },
                                        "src": "950:18:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_struct$_Task_$41_storage",
                                            "typeString": "struct TodoList.Task storage ref"
                                        }
                                    },
                                    "id": 109,
                                    "nodeType": "ExpressionStatement",
                                    "src": "950:18:0"
                                },
                                {
                                    "eventCall": {
                                        "argumentTypes": null,
                                        "arguments": [
                                            {
                                                "argumentTypes": null,
                                                "id": 111,
                                                "name": "_id",
                                                "nodeType": "Identifier",
                                                "overloadedDeclarations": [],
                                                "referencedDeclaration": 79,
                                                "src": "996:3:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                }
                                            },
                                            {
                                                "argumentTypes": null,
                                                "expression": {
                                                    "argumentTypes": null,
                                                    "id": 112,
                                                    "name": "_task",
                                                    "nodeType": "Identifier",
                                                    "overloadedDeclarations": [],
                                                    "referencedDeclaration": 91,
                                                    "src": "1001:5:0",
                                                    "typeDescriptions": {
                                                        "typeIdentifier": "t_struct$_Task_$41_memory_ptr",
                                                        "typeString": "struct TodoList.Task memory"
                                                    }
                                                },
                                                "id": 113,
                                                "isConstant": false,
                                                "isLValue": true,
                                                "isPure": false,
                                                "lValueRequested": false,
                                                "memberName": "finished",
                                                "nodeType": "MemberAccess",
                                                "referencedDeclaration": 40,
                                                "src": "1001:14:0",
                                                "typeDescriptions": {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            }
                                        ],
                                        "expression": {
                                            "argumentTypes": [
                                                {
                                                    "typeIdentifier": "t_uint256",
                                                    "typeString": "uint256"
                                                },
                                                {
                                                    "typeIdentifier": "t_bool",
                                                    "typeString": "bool"
                                                }
                                            ],
                                            "id": 110,
                                            "name": "TaskFinished",
                                            "nodeType": "Identifier",
                                            "overloadedDeclarations": [],
                                            "referencedDeclaration": 26,
                                            "src": "983:12:0",
                                            "typeDescriptions": {
                                                "typeIdentifier": "t_function_event_nonpayable$_t_uint256_$_t_bool_$returns$__$",
                                                "typeString": "function (uint256,bool)"
                                            }
                                        },
                                        "id": 114,
                                        "isConstant": false,
                                        "isLValue": false,
                                        "isPure": false,
                                        "kind": "functionCall",
                                        "lValueRequested": false,
                                        "names": [],
                                        "nodeType": "FunctionCall",
                                        "src": "983:33:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_tuple$__$",
                                            "typeString": "tuple()"
                                        }
                                    },
                                    "id": 115,
                                    "nodeType": "EmitStatement",
                                    "src": "978:38:0"
                                }
                            ]
                        },
                        "documentation": null,
                        "id": 117,
                        "implemented": true,
                        "kind": "function",
                        "modifiers": [],
                        "name": "toggleFinished",
                        "nodeType": "FunctionDefinition",
                        "parameters": {
                            "id": 80,
                            "nodeType": "ParameterList",
                            "parameters": [
                                {
                                    "constant": false,
                                    "id": 79,
                                    "name": "_id",
                                    "nodeType": "VariableDeclaration",
                                    "scope": 117,
                                    "src": "782:11:0",
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "typeDescriptions": {
                                        "typeIdentifier": "t_uint256",
                                        "typeString": "uint256"
                                    },
                                    "typeName": {
                                        "id": 78,
                                        "name": "uint256",
                                        "nodeType": "ElementaryTypeName",
                                        "src": "782:7:0",
                                        "typeDescriptions": {
                                            "typeIdentifier": "t_uint256",
                                            "typeString": "uint256"
                                        }
                                    },
                                    "value": null,
                                    "visibility": "internal"
                                }
                            ],
                            "src": "781:13:0"
                        },
                        "returnParameters": {
                            "id": 81,
                            "nodeType": "ParameterList",
                            "parameters": [],
                            "src": "802:0:0"
                        },
                        "scope": 118,
                        "src": "758:265:0",
                        "stateMutability": "nonpayable",
                        "superFunction": null,
                        "visibility": "public"
                    }
                ],
                "scope": 119,
                "src": "66:959:0"
            }
        ],
        "src": "32:994:0"
    },
    "legacyAST": {
        "attributes": {
            "absolutePath": "project:/contracts/TodoList.sol",
            "exportedSymbols": {
                "TodoList": [
                    118
                ]
            }
        },
        "children": [
            {
                "attributes": {
                    "literals": [
                        "solidity",
                        ">=",
                        "0.4",
                        ".22",
                        "<",
                        "0.9",
                        ".0"
                    ]
                },
                "id": 1,
                "name": "PragmaDirective",
                "src": "32:32:0"
            },
            {
                "attributes": {
                    "baseContracts": [
                        null
                    ],
                    "contractDependencies": [
                        null
                    ],
                    "contractKind": "contract",
                    "documentation": null,
                    "fullyImplemented": true,
                    "linearizedBaseContracts": [
                        118
                    ],
                    "name": "TodoList",
                    "scope": 119
                },
                "children": [
                    {
                        "attributes": {
                            "constant": false,
                            "name": "tasks",
                            "scope": 118,
                            "stateVariable": true,
                            "storageLocation": "default",
                            "type": "mapping(uint256 => struct TodoList.Task)",
                            "value": null,
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "attributes": {
                                    "type": "mapping(uint256 => struct TodoList.Task)"
                                },
                                "children": [
                                    {
                                        "attributes": {
                                            "name": "uint256",
                                            "type": "uint256"
                                        },
                                        "id": 2,
                                        "name": "ElementaryTypeName",
                                        "src": "98:7:0"
                                    },
                                    {
                                        "attributes": {
                                            "contractScope": null,
                                            "name": "Task",
                                            "referencedDeclaration": 41,
                                            "type": "struct TodoList.Task"
                                        },
                                        "id": 3,
                                        "name": "UserDefinedTypeName",
                                        "src": "109:4:0"
                                    }
                                ],
                                "id": 4,
                                "name": "Mapping",
                                "src": "90:24:0"
                            }
                        ],
                        "id": 5,
                        "name": "VariableDeclaration",
                        "src": "90:37:0"
                    },
                    {
                        "attributes": {
                            "constant": false,
                            "name": "taskCount",
                            "scope": 118,
                            "stateVariable": true,
                            "storageLocation": "default",
                            "type": "uint256",
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "attributes": {
                                    "name": "uint256",
                                    "type": "uint256"
                                },
                                "id": 6,
                                "name": "ElementaryTypeName",
                                "src": "133:7:0"
                            },
                            {
                                "attributes": {
                                    "argumentTypes": null,
                                    "hexvalue": "30",
                                    "isConstant": false,
                                    "isLValue": false,
                                    "isPure": true,
                                    "lValueRequested": false,
                                    "subdenomination": null,
                                    "token": "number",
                                    "type": "int_const 0",
                                    "value": "0"
                                },
                                "id": 7,
                                "name": "Literal",
                                "src": "160:1:0"
                            }
                        ],
                        "id": 8,
                        "name": "VariableDeclaration",
                        "src": "133:28:0"
                    },
                    {
                        "attributes": {
                            "constant": false,
                            "name": "owner",
                            "scope": 118,
                            "stateVariable": true,
                            "storageLocation": "default",
                            "type": "address",
                            "visibility": "internal"
                        },
                        "children": [
                            {
                                "attributes": {
                                    "name": "address",
                                    "stateMutability": "nonpayable",
                                    "type": "address"
                                },
                                "id": 9,
                                "name": "ElementaryTypeName",
                                "src": "167:7:0"
                            },
                            {
                                "attributes": {
                                    "argumentTypes": null,
                                    "isConstant": false,
                                    "isLValue": false,
                                    "isPure": false,
                                    "lValueRequested": false,
                                    "member_name": "sender",
                                    "referencedDeclaration": null,
                                    "type": "address payable"
                                },
                                "children": [
                                    {
                                        "attributes": {
                                            "argumentTypes": null,
                                            "overloadedDeclarations": [
                                                null
                                            ],
                                            "referencedDeclaration": 133,
                                            "type": "msg",
                                            "value": "msg"
                                        },
                                        "id": 10,
                                        "name": "Identifier",
                                        "src": "183:3:0"
                                    }
                                ],
                                "id": 11,
                                "name": "MemberAccess",
                                "src": "183:10:0"
                            }
                        ],
                        "id": 12,
                        "name": "VariableDeclaration",
                        "src": "167:26:0"
                    },
                    {
                        "attributes": {
                            "anonymous": false,
                            "documentation": null,
                            "name": "TaskCreated"
                        },
                        "children": [
                            {
                                "children": [
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "indexed": false,
                                            "name": "id",
                                            "scope": 20,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "uint256",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "uint256",
                                                    "type": "uint256"
                                                },
                                                "id": 13,
                                                "name": "ElementaryTypeName",
                                                "src": "218:7:0"
                                            }
                                        ],
                                        "id": 14,
                                        "name": "VariableDeclaration",
                                        "src": "218:10:0"
                                    },
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "indexed": false,
                                            "name": "content",
                                            "scope": 20,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "string",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "string",
                                                    "type": "string"
                                                },
                                                "id": 15,
                                                "name": "ElementaryTypeName",
                                                "src": "230:6:0"
                                            }
                                        ],
                                        "id": 16,
                                        "name": "VariableDeclaration",
                                        "src": "230:14:0"
                                    },
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "indexed": false,
                                            "name": "finished",
                                            "scope": 20,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "bool",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "bool",
                                                    "type": "bool"
                                                },
                                                "id": 17,
                                                "name": "ElementaryTypeName",
                                                "src": "246:4:0"
                                            }
                                        ],
                                        "id": 18,
                                        "name": "VariableDeclaration",
                                        "src": "246:13:0"
                                    }
                                ],
                                "id": 19,
                                "name": "ParameterList",
                                "src": "217:43:0"
                            }
                        ],
                        "id": 20,
                        "name": "EventDefinition",
                        "src": "200:61:0"
                    },
                    {
                        "attributes": {
                            "anonymous": false,
                            "documentation": null,
                            "name": "TaskFinished"
                        },
                        "children": [
                            {
                                "children": [
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "indexed": false,
                                            "name": "id",
                                            "scope": 26,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "uint256",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "uint256",
                                                    "type": "uint256"
                                                },
                                                "id": 21,
                                                "name": "ElementaryTypeName",
                                                "src": "285:7:0"
                                            }
                                        ],
                                        "id": 22,
                                        "name": "VariableDeclaration",
                                        "src": "285:10:0"
                                    },
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "indexed": false,
                                            "name": "finished",
                                            "scope": 26,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "bool",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "bool",
                                                    "type": "bool"
                                                },
                                                "id": 23,
                                                "name": "ElementaryTypeName",
                                                "src": "297:4:0"
                                            }
                                        ],
                                        "id": 24,
                                        "name": "VariableDeclaration",
                                        "src": "297:13:0"
                                    }
                                ],
                                "id": 25,
                                "name": "ParameterList",
                                "src": "284:27:0"
                            }
                        ],
                        "id": 26,
                        "name": "EventDefinition",
                        "src": "266:46:0"
                    },
                    {
                        "attributes": {
                            "documentation": null,
                            "implemented": true,
                            "isConstructor": true,
                            "kind": "constructor",
                            "modifiers": [
                                null
                            ],
                            "name": "",
                            "scope": 118,
                            "stateMutability": "nonpayable",
                            "superFunction": null,
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "attributes": {
                                    "parameters": [
                                        null
                                    ]
                                },
                                "children": [],
                                "id": 27,
                                "name": "ParameterList",
                                "src": "329:2:0"
                            },
                            {
                                "attributes": {
                                    "parameters": [
                                        null
                                    ]
                                },
                                "children": [],
                                "id": 28,
                                "name": "ParameterList",
                                "src": "339:0:0"
                            },
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "isStructConstructorCall": false,
                                                    "lValueRequested": false,
                                                    "names": [
                                                        null
                                                    ],
                                                    "type": "tuple()",
                                                    "type_conversion": false
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": [
                                                                {
                                                                    "typeIdentifier": "t_stringliteral_6bdf4066905b4b6eff08c677de4873c88b6b5bfb937c18b734b059275ce526a1",
                                                                    "typeString": "literal_string \"Finish final project\""
                                                                }
                                                            ],
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 77,
                                                            "type": "function (string memory)",
                                                            "value": "createTask"
                                                        },
                                                        "id": 29,
                                                        "name": "Identifier",
                                                        "src": "349:10:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "hexvalue": "46696e6973682066696e616c2070726f6a656374",
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": true,
                                                            "lValueRequested": false,
                                                            "subdenomination": null,
                                                            "token": "string",
                                                            "type": "literal_string \"Finish final project\"",
                                                            "value": "Finish final project"
                                                        },
                                                        "id": 30,
                                                        "name": "Literal",
                                                        "src": "360:22:0"
                                                    }
                                                ],
                                                "id": 31,
                                                "name": "FunctionCall",
                                                "src": "349:34:0"
                                            }
                                        ],
                                        "id": 32,
                                        "name": "ExpressionStatement",
                                        "src": "349:34:0"
                                    }
                                ],
                                "id": 33,
                                "name": "Block",
                                "src": "339:51:0"
                            }
                        ],
                        "id": 34,
                        "name": "FunctionDefinition",
                        "src": "318:72:0"
                    },
                    {
                        "attributes": {
                            "canonicalName": "TodoList.Task",
                            "name": "Task",
                            "scope": 118,
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "attributes": {
                                    "constant": false,
                                    "name": "id",
                                    "scope": 41,
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "type": "uint256",
                                    "value": null,
                                    "visibility": "internal"
                                },
                                "children": [
                                    {
                                        "attributes": {
                                            "name": "uint256",
                                            "type": "uint256"
                                        },
                                        "id": 35,
                                        "name": "ElementaryTypeName",
                                        "src": "418:7:0"
                                    }
                                ],
                                "id": 36,
                                "name": "VariableDeclaration",
                                "src": "418:10:0"
                            },
                            {
                                "attributes": {
                                    "constant": false,
                                    "name": "content",
                                    "scope": 41,
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "type": "string",
                                    "value": null,
                                    "visibility": "internal"
                                },
                                "children": [
                                    {
                                        "attributes": {
                                            "name": "string",
                                            "type": "string"
                                        },
                                        "id": 37,
                                        "name": "ElementaryTypeName",
                                        "src": "438:6:0"
                                    }
                                ],
                                "id": 38,
                                "name": "VariableDeclaration",
                                "src": "438:14:0"
                            },
                            {
                                "attributes": {
                                    "constant": false,
                                    "name": "finished",
                                    "scope": 41,
                                    "stateVariable": false,
                                    "storageLocation": "default",
                                    "type": "bool",
                                    "value": null,
                                    "visibility": "internal"
                                },
                                "children": [
                                    {
                                        "attributes": {
                                            "name": "bool",
                                            "type": "bool"
                                        },
                                        "id": 39,
                                        "name": "ElementaryTypeName",
                                        "src": "462:4:0"
                                    }
                                ],
                                "id": 40,
                                "name": "VariableDeclaration",
                                "src": "462:13:0"
                            }
                        ],
                        "id": 41,
                        "name": "StructDefinition",
                        "src": "396:86:0"
                    },
                    {
                        "attributes": {
                            "documentation": null,
                            "implemented": true,
                            "isConstructor": false,
                            "kind": "function",
                            "modifiers": [
                                null
                            ],
                            "name": "createTask",
                            "scope": 118,
                            "stateMutability": "nonpayable",
                            "superFunction": null,
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "children": [
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "name": "_content",
                                            "scope": 77,
                                            "stateVariable": false,
                                            "storageLocation": "memory",
                                            "type": "string",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "string",
                                                    "type": "string"
                                                },
                                                "id": 42,
                                                "name": "ElementaryTypeName",
                                                "src": "508:6:0"
                                            }
                                        ],
                                        "id": 43,
                                        "name": "VariableDeclaration",
                                        "src": "508:22:0"
                                    }
                                ],
                                "id": 44,
                                "name": "ParameterList",
                                "src": "507:24:0"
                            },
                            {
                                "attributes": {
                                    "parameters": [
                                        null
                                    ]
                                },
                                "children": [],
                                "id": 45,
                                "name": "ParameterList",
                                "src": "539:0:0"
                            },
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "isStructConstructorCall": false,
                                                    "lValueRequested": false,
                                                    "names": [
                                                        null
                                                    ],
                                                    "type": "tuple()",
                                                    "type_conversion": false
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": [
                                                                {
                                                                    "typeIdentifier": "t_bool",
                                                                    "typeString": "bool"
                                                                },
                                                                {
                                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                                    "typeString": "literal_string \"Not the owner!\""
                                                                }
                                                            ],
                                                            "overloadedDeclarations": [
                                                                136,
                                                                137
                                                            ],
                                                            "referencedDeclaration": 137,
                                                            "type": "function (bool,string memory) pure",
                                                            "value": "require"
                                                        },
                                                        "id": 46,
                                                        "name": "Identifier",
                                                        "src": "549:7:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "commonType": {
                                                                "typeIdentifier": "t_address",
                                                                "typeString": "address"
                                                            },
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": false,
                                                            "lValueRequested": false,
                                                            "operator": "==",
                                                            "type": "bool"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "isConstant": false,
                                                                    "isLValue": false,
                                                                    "isPure": false,
                                                                    "lValueRequested": false,
                                                                    "member_name": "sender",
                                                                    "referencedDeclaration": null,
                                                                    "type": "address payable"
                                                                },
                                                                "children": [
                                                                    {
                                                                        "attributes": {
                                                                            "argumentTypes": null,
                                                                            "overloadedDeclarations": [
                                                                                null
                                                                            ],
                                                                            "referencedDeclaration": 133,
                                                                            "type": "msg",
                                                                            "value": "msg"
                                                                        },
                                                                        "id": 47,
                                                                        "name": "Identifier",
                                                                        "src": "557:3:0"
                                                                    }
                                                                ],
                                                                "id": 48,
                                                                "name": "MemberAccess",
                                                                "src": "557:10:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 12,
                                                                    "type": "address",
                                                                    "value": "owner"
                                                                },
                                                                "id": 49,
                                                                "name": "Identifier",
                                                                "src": "571:5:0"
                                                            }
                                                        ],
                                                        "id": 50,
                                                        "name": "BinaryOperation",
                                                        "src": "557:19:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "hexvalue": "4e6f7420746865206f776e657221",
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": true,
                                                            "lValueRequested": false,
                                                            "subdenomination": null,
                                                            "token": "string",
                                                            "type": "literal_string \"Not the owner!\"",
                                                            "value": "Not the owner!"
                                                        },
                                                        "id": 51,
                                                        "name": "Literal",
                                                        "src": "578:16:0"
                                                    }
                                                ],
                                                "id": 52,
                                                "name": "FunctionCall",
                                                "src": "549:46:0"
                                            }
                                        ],
                                        "id": 53,
                                        "name": "ExpressionStatement",
                                        "src": "549:46:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "operator": "=",
                                                    "type": "uint256"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 8,
                                                            "type": "uint256",
                                                            "value": "taskCount"
                                                        },
                                                        "id": 54,
                                                        "name": "Identifier",
                                                        "src": "605:9:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "commonType": {
                                                                "typeIdentifier": "t_uint256",
                                                                "typeString": "uint256"
                                                            },
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": false,
                                                            "lValueRequested": false,
                                                            "operator": "+",
                                                            "type": "uint256"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 8,
                                                                    "type": "uint256",
                                                                    "value": "taskCount"
                                                                },
                                                                "id": 55,
                                                                "name": "Identifier",
                                                                "src": "617:9:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "hexvalue": "31",
                                                                    "isConstant": false,
                                                                    "isLValue": false,
                                                                    "isPure": true,
                                                                    "lValueRequested": false,
                                                                    "subdenomination": null,
                                                                    "token": "number",
                                                                    "type": "int_const 1",
                                                                    "value": "1"
                                                                },
                                                                "id": 56,
                                                                "name": "Literal",
                                                                "src": "629:1:0"
                                                            }
                                                        ],
                                                        "id": 57,
                                                        "name": "BinaryOperation",
                                                        "src": "617:13:0"
                                                    }
                                                ],
                                                "id": 58,
                                                "name": "Assignment",
                                                "src": "605:25:0"
                                            }
                                        ],
                                        "id": 59,
                                        "name": "ExpressionStatement",
                                        "src": "605:25:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "operator": "=",
                                                    "type": "struct TodoList.Task storage ref"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": true,
                                                            "isPure": false,
                                                            "lValueRequested": true,
                                                            "type": "struct TodoList.Task storage ref"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 5,
                                                                    "type": "mapping(uint256 => struct TodoList.Task storage ref)",
                                                                    "value": "tasks"
                                                                },
                                                                "id": 60,
                                                                "name": "Identifier",
                                                                "src": "640:5:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 8,
                                                                    "type": "uint256",
                                                                    "value": "taskCount"
                                                                },
                                                                "id": 61,
                                                                "name": "Identifier",
                                                                "src": "646:9:0"
                                                            }
                                                        ],
                                                        "id": 62,
                                                        "name": "IndexAccess",
                                                        "src": "640:16:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": false,
                                                            "isStructConstructorCall": true,
                                                            "lValueRequested": false,
                                                            "names": [
                                                                null
                                                            ],
                                                            "type": "struct TodoList.Task memory",
                                                            "type_conversion": false
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": [
                                                                        {
                                                                            "typeIdentifier": "t_uint256",
                                                                            "typeString": "uint256"
                                                                        },
                                                                        {
                                                                            "typeIdentifier": "t_string_memory_ptr",
                                                                            "typeString": "string memory"
                                                                        },
                                                                        {
                                                                            "typeIdentifier": "t_bool",
                                                                            "typeString": "bool"
                                                                        }
                                                                    ],
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 41,
                                                                    "type": "type(struct TodoList.Task storage pointer)",
                                                                    "value": "Task"
                                                                },
                                                                "id": 63,
                                                                "name": "Identifier",
                                                                "src": "659:4:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 8,
                                                                    "type": "uint256",
                                                                    "value": "taskCount"
                                                                },
                                                                "id": 64,
                                                                "name": "Identifier",
                                                                "src": "664:9:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 43,
                                                                    "type": "string memory",
                                                                    "value": "_content"
                                                                },
                                                                "id": 65,
                                                                "name": "Identifier",
                                                                "src": "675:8:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "hexvalue": "66616c7365",
                                                                    "isConstant": false,
                                                                    "isLValue": false,
                                                                    "isPure": true,
                                                                    "lValueRequested": false,
                                                                    "subdenomination": null,
                                                                    "token": "bool",
                                                                    "type": "bool",
                                                                    "value": "false"
                                                                },
                                                                "id": 66,
                                                                "name": "Literal",
                                                                "src": "685:5:0"
                                                            }
                                                        ],
                                                        "id": 67,
                                                        "name": "FunctionCall",
                                                        "src": "659:32:0"
                                                    }
                                                ],
                                                "id": 68,
                                                "name": "Assignment",
                                                "src": "640:51:0"
                                            }
                                        ],
                                        "id": 69,
                                        "name": "ExpressionStatement",
                                        "src": "640:51:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "isStructConstructorCall": false,
                                                    "lValueRequested": false,
                                                    "names": [
                                                        null
                                                    ],
                                                    "type": "tuple()",
                                                    "type_conversion": false
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": [
                                                                {
                                                                    "typeIdentifier": "t_uint256",
                                                                    "typeString": "uint256"
                                                                },
                                                                {
                                                                    "typeIdentifier": "t_string_memory_ptr",
                                                                    "typeString": "string memory"
                                                                },
                                                                {
                                                                    "typeIdentifier": "t_bool",
                                                                    "typeString": "bool"
                                                                }
                                                            ],
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 20,
                                                            "type": "function (uint256,string memory,bool)",
                                                            "value": "TaskCreated"
                                                        },
                                                        "id": 70,
                                                        "name": "Identifier",
                                                        "src": "706:11:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 8,
                                                            "type": "uint256",
                                                            "value": "taskCount"
                                                        },
                                                        "id": 71,
                                                        "name": "Identifier",
                                                        "src": "718:9:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 43,
                                                            "type": "string memory",
                                                            "value": "_content"
                                                        },
                                                        "id": 72,
                                                        "name": "Identifier",
                                                        "src": "729:8:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "hexvalue": "66616c7365",
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": true,
                                                            "lValueRequested": false,
                                                            "subdenomination": null,
                                                            "token": "bool",
                                                            "type": "bool",
                                                            "value": "false"
                                                        },
                                                        "id": 73,
                                                        "name": "Literal",
                                                        "src": "739:5:0"
                                                    }
                                                ],
                                                "id": 74,
                                                "name": "FunctionCall",
                                                "src": "706:39:0"
                                            }
                                        ],
                                        "id": 75,
                                        "name": "EmitStatement",
                                        "src": "701:44:0"
                                    }
                                ],
                                "id": 76,
                                "name": "Block",
                                "src": "539:213:0"
                            }
                        ],
                        "id": 77,
                        "name": "FunctionDefinition",
                        "src": "488:264:0"
                    },
                    {
                        "attributes": {
                            "documentation": null,
                            "implemented": true,
                            "isConstructor": false,
                            "kind": "function",
                            "modifiers": [
                                null
                            ],
                            "name": "toggleFinished",
                            "scope": 118,
                            "stateMutability": "nonpayable",
                            "superFunction": null,
                            "visibility": "public"
                        },
                        "children": [
                            {
                                "children": [
                                    {
                                        "attributes": {
                                            "constant": false,
                                            "name": "_id",
                                            "scope": 117,
                                            "stateVariable": false,
                                            "storageLocation": "default",
                                            "type": "uint256",
                                            "value": null,
                                            "visibility": "internal"
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "name": "uint256",
                                                    "type": "uint256"
                                                },
                                                "id": 78,
                                                "name": "ElementaryTypeName",
                                                "src": "782:7:0"
                                            }
                                        ],
                                        "id": 79,
                                        "name": "VariableDeclaration",
                                        "src": "782:11:0"
                                    }
                                ],
                                "id": 80,
                                "name": "ParameterList",
                                "src": "781:13:0"
                            },
                            {
                                "attributes": {
                                    "parameters": [
                                        null
                                    ]
                                },
                                "children": [],
                                "id": 81,
                                "name": "ParameterList",
                                "src": "802:0:0"
                            },
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "isStructConstructorCall": false,
                                                    "lValueRequested": false,
                                                    "names": [
                                                        null
                                                    ],
                                                    "type": "tuple()",
                                                    "type_conversion": false
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": [
                                                                {
                                                                    "typeIdentifier": "t_bool",
                                                                    "typeString": "bool"
                                                                },
                                                                {
                                                                    "typeIdentifier": "t_stringliteral_ce2e6cc84efd132511e798b618c37a8ba1faec84e53763d7be25e94854c70791",
                                                                    "typeString": "literal_string \"Not the owner!\""
                                                                }
                                                            ],
                                                            "overloadedDeclarations": [
                                                                136,
                                                                137
                                                            ],
                                                            "referencedDeclaration": 137,
                                                            "type": "function (bool,string memory) pure",
                                                            "value": "require"
                                                        },
                                                        "id": 82,
                                                        "name": "Identifier",
                                                        "src": "812:7:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "commonType": {
                                                                "typeIdentifier": "t_address",
                                                                "typeString": "address"
                                                            },
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": false,
                                                            "lValueRequested": false,
                                                            "operator": "==",
                                                            "type": "bool"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "isConstant": false,
                                                                    "isLValue": false,
                                                                    "isPure": false,
                                                                    "lValueRequested": false,
                                                                    "member_name": "sender",
                                                                    "referencedDeclaration": null,
                                                                    "type": "address payable"
                                                                },
                                                                "children": [
                                                                    {
                                                                        "attributes": {
                                                                            "argumentTypes": null,
                                                                            "overloadedDeclarations": [
                                                                                null
                                                                            ],
                                                                            "referencedDeclaration": 133,
                                                                            "type": "msg",
                                                                            "value": "msg"
                                                                        },
                                                                        "id": 83,
                                                                        "name": "Identifier",
                                                                        "src": "820:3:0"
                                                                    }
                                                                ],
                                                                "id": 84,
                                                                "name": "MemberAccess",
                                                                "src": "820:10:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 12,
                                                                    "type": "address",
                                                                    "value": "owner"
                                                                },
                                                                "id": 85,
                                                                "name": "Identifier",
                                                                "src": "834:5:0"
                                                            }
                                                        ],
                                                        "id": 86,
                                                        "name": "BinaryOperation",
                                                        "src": "820:19:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "hexvalue": "4e6f7420746865206f776e657221",
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": true,
                                                            "lValueRequested": false,
                                                            "subdenomination": null,
                                                            "token": "string",
                                                            "type": "literal_string \"Not the owner!\"",
                                                            "value": "Not the owner!"
                                                        },
                                                        "id": 87,
                                                        "name": "Literal",
                                                        "src": "841:16:0"
                                                    }
                                                ],
                                                "id": 88,
                                                "name": "FunctionCall",
                                                "src": "812:46:0"
                                            }
                                        ],
                                        "id": 89,
                                        "name": "ExpressionStatement",
                                        "src": "812:46:0"
                                    },
                                    {
                                        "attributes": {
                                            "assignments": [
                                                91
                                            ]
                                        },
                                        "children": [
                                            {
                                                "attributes": {
                                                    "constant": false,
                                                    "name": "_task",
                                                    "scope": 116,
                                                    "stateVariable": false,
                                                    "storageLocation": "memory",
                                                    "type": "struct TodoList.Task",
                                                    "value": null,
                                                    "visibility": "internal"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "contractScope": null,
                                                            "name": "Task",
                                                            "referencedDeclaration": 41,
                                                            "type": "struct TodoList.Task"
                                                        },
                                                        "id": 90,
                                                        "name": "UserDefinedTypeName",
                                                        "src": "868:4:0"
                                                    }
                                                ],
                                                "id": 91,
                                                "name": "VariableDeclaration",
                                                "src": "868:17:0"
                                            },
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": true,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "type": "struct TodoList.Task storage ref"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 5,
                                                            "type": "mapping(uint256 => struct TodoList.Task storage ref)",
                                                            "value": "tasks"
                                                        },
                                                        "id": 92,
                                                        "name": "Identifier",
                                                        "src": "888:5:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 79,
                                                            "type": "uint256",
                                                            "value": "_id"
                                                        },
                                                        "id": 93,
                                                        "name": "Identifier",
                                                        "src": "894:3:0"
                                                    }
                                                ],
                                                "id": 94,
                                                "name": "IndexAccess",
                                                "src": "888:10:0"
                                            }
                                        ],
                                        "id": 95,
                                        "name": "VariableDeclarationStatement",
                                        "src": "868:30:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "operator": "=",
                                                    "type": "bool"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": true,
                                                            "isPure": false,
                                                            "lValueRequested": true,
                                                            "member_name": "finished",
                                                            "referencedDeclaration": 40,
                                                            "type": "bool"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 91,
                                                                    "type": "struct TodoList.Task memory",
                                                                    "value": "_task"
                                                                },
                                                                "id": 96,
                                                                "name": "Identifier",
                                                                "src": "908:5:0"
                                                            }
                                                        ],
                                                        "id": 98,
                                                        "name": "MemberAccess",
                                                        "src": "908:14:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": false,
                                                            "isPure": false,
                                                            "lValueRequested": false,
                                                            "operator": "!",
                                                            "prefix": true,
                                                            "type": "bool"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "isConstant": false,
                                                                    "isLValue": true,
                                                                    "isPure": false,
                                                                    "lValueRequested": false,
                                                                    "member_name": "finished",
                                                                    "referencedDeclaration": 40,
                                                                    "type": "bool"
                                                                },
                                                                "children": [
                                                                    {
                                                                        "attributes": {
                                                                            "argumentTypes": null,
                                                                            "overloadedDeclarations": [
                                                                                null
                                                                            ],
                                                                            "referencedDeclaration": 91,
                                                                            "type": "struct TodoList.Task memory",
                                                                            "value": "_task"
                                                                        },
                                                                        "id": 99,
                                                                        "name": "Identifier",
                                                                        "src": "926:5:0"
                                                                    }
                                                                ],
                                                                "id": 100,
                                                                "name": "MemberAccess",
                                                                "src": "926:14:0"
                                                            }
                                                        ],
                                                        "id": 101,
                                                        "name": "UnaryOperation",
                                                        "src": "925:15:0"
                                                    }
                                                ],
                                                "id": 102,
                                                "name": "Assignment",
                                                "src": "908:32:0"
                                            }
                                        ],
                                        "id": 103,
                                        "name": "ExpressionStatement",
                                        "src": "908:32:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "lValueRequested": false,
                                                    "operator": "=",
                                                    "type": "struct TodoList.Task storage ref"
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": true,
                                                            "isPure": false,
                                                            "lValueRequested": true,
                                                            "type": "struct TodoList.Task storage ref"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 5,
                                                                    "type": "mapping(uint256 => struct TodoList.Task storage ref)",
                                                                    "value": "tasks"
                                                                },
                                                                "id": 104,
                                                                "name": "Identifier",
                                                                "src": "950:5:0"
                                                            },
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 79,
                                                                    "type": "uint256",
                                                                    "value": "_id"
                                                                },
                                                                "id": 105,
                                                                "name": "Identifier",
                                                                "src": "956:3:0"
                                                            }
                                                        ],
                                                        "id": 106,
                                                        "name": "IndexAccess",
                                                        "src": "950:10:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 91,
                                                            "type": "struct TodoList.Task memory",
                                                            "value": "_task"
                                                        },
                                                        "id": 107,
                                                        "name": "Identifier",
                                                        "src": "963:5:0"
                                                    }
                                                ],
                                                "id": 108,
                                                "name": "Assignment",
                                                "src": "950:18:0"
                                            }
                                        ],
                                        "id": 109,
                                        "name": "ExpressionStatement",
                                        "src": "950:18:0"
                                    },
                                    {
                                        "children": [
                                            {
                                                "attributes": {
                                                    "argumentTypes": null,
                                                    "isConstant": false,
                                                    "isLValue": false,
                                                    "isPure": false,
                                                    "isStructConstructorCall": false,
                                                    "lValueRequested": false,
                                                    "names": [
                                                        null
                                                    ],
                                                    "type": "tuple()",
                                                    "type_conversion": false
                                                },
                                                "children": [
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": [
                                                                {
                                                                    "typeIdentifier": "t_uint256",
                                                                    "typeString": "uint256"
                                                                },
                                                                {
                                                                    "typeIdentifier": "t_bool",
                                                                    "typeString": "bool"
                                                                }
                                                            ],
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 26,
                                                            "type": "function (uint256,bool)",
                                                            "value": "TaskFinished"
                                                        },
                                                        "id": 110,
                                                        "name": "Identifier",
                                                        "src": "983:12:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "overloadedDeclarations": [
                                                                null
                                                            ],
                                                            "referencedDeclaration": 79,
                                                            "type": "uint256",
                                                            "value": "_id"
                                                        },
                                                        "id": 111,
                                                        "name": "Identifier",
                                                        "src": "996:3:0"
                                                    },
                                                    {
                                                        "attributes": {
                                                            "argumentTypes": null,
                                                            "isConstant": false,
                                                            "isLValue": true,
                                                            "isPure": false,
                                                            "lValueRequested": false,
                                                            "member_name": "finished",
                                                            "referencedDeclaration": 40,
                                                            "type": "bool"
                                                        },
                                                        "children": [
                                                            {
                                                                "attributes": {
                                                                    "argumentTypes": null,
                                                                    "overloadedDeclarations": [
                                                                        null
                                                                    ],
                                                                    "referencedDeclaration": 91,
                                                                    "type": "struct TodoList.Task memory",
                                                                    "value": "_task"
                                                                },
                                                                "id": 112,
                                                                "name": "Identifier",
                                                                "src": "1001:5:0"
                                                            }
                                                        ],
                                                        "id": 113,
                                                        "name": "MemberAccess",
                                                        "src": "1001:14:0"
                                                    }
                                                ],
                                                "id": 114,
                                                "name": "FunctionCall",
                                                "src": "983:33:0"
                                            }
                                        ],
                                        "id": 115,
                                        "name": "EmitStatement",
                                        "src": "978:38:0"
                                    }
                                ],
                                "id": 116,
                                "name": "Block",
                                "src": "802:221:0"
                            }
                        ],
                        "id": 117,
                        "name": "FunctionDefinition",
                        "src": "758:265:0"
                    }
                ],
                "id": 118,
                "name": "ContractDefinition",
                "src": "66:959:0"
            }
        ],
        "id": 119,
        "name": "SourceUnit",
        "src": "32:994:0"
    },
    "compiler": {
        "name": "solc",
        "version": "0.5.16+commit.9c3226ce.Emscripten.clang"
    },
    "networks": {
        "3": {
            "events": {},
            "links": {},
            "address": "0xC70ff1396d1C8c4A9be100cEDc94E718D151727E",
            "transactionHash": "0x387ec327609a199fa01a19c5b3ff9c67fe7c0c8a184a776dccb24878a74754c7"
        },
        "5777": {
            "events": {
                "0x05d0fb833127fc08168556d0e7ca9554fc3f6bc843b3b7d2bf1c35aea6bab660": {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        },
                        {
                            "indexed": false,
                            "internalType": "bool",
                            "name": "finished",
                            "type": "bool"
                        }
                    ],
                    "name": "TaskCreated",
                    "type": "event"
                },
                "0x30e68b2d9517fd20aaa9bce3c19cb9a5e3b56519ed01102f2607735b85deba92": {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "bool",
                            "name": "finished",
                            "type": "bool"
                        }
                    ],
                    "name": "TaskFinished",
                    "type": "event"
                }
            },
            "links": {},
            "address": "0x18F512023290f1A4111Bb42Cda1fe4426E4F8Bc8",
            "transactionHash": "0x8518b94d8035b6dc87d125274bf8cf4849358e25ace97dc6fe0ea4aa9b1d954f"
        }
    },
    "schemaVersion": "3.4.3",
    "updatedAt": "2021-12-15T13:06:34.238Z",
    "networkType": "ethereum",
    "devdoc": {
        "methods": {}
    },
    "userdoc": {
        "methods": {}
    }
}