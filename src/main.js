import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x752f6Ea76a14a00b9E0005A4018BEf3A6138A42d"
const cUSDContractAddress = "0xD3f6896b6F90fE4c93001190b1082d3780643fD6"

let kit
let contract
let campaigns = []

// check if celo wallet extension is available in the browser
const connectCeloWallet = async function () {
  if (window.celo) {
    notification("Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(` ${error}.`)
    }
  } else {
    notification("Please install the CeloExtensionWallet.")
  }
}


// approve payment
async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

// get buyers account balance
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

// Fetch hospitals from smart contract
const getCampaigns = async function() {
  const _campaignsLength = await contract.methods.getCampaignsLength().call()
  const _campaigns = []
  for (let i = 0; i < _campaignsLength; i++) {
    let _campaign = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readCampaigns(i).call()
      resolve({
        index: i,
        creator: p[0],
        goal: new BigNumber(p[1]),
        pledged: new BigNumber(p[2]),
        startAt: new BigNumber(p[3]),
        // location: p[4],
        endAt: new BigNumber(p[4]),
        claimed: new BigNumber(p[5])
      })
    })
    _campaigns.push(_campaign)
  }
  campaigns = await Promise.all(_campaigns)
  console.log(campaigns)
  renderCampaigns()
}

// display our hospitals in the user interface
function renderCampaigns() {
  document.getElementById("marketplace").innerHTML = ""
  campaigns.forEach((_campaign) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = campaignTemplate(_campaign)
    document.getElementById("marketplace").appendChild(newDiv)
  })

}

// template for building hospitals user interface
function campaignTemplate(_campaign) {
  return `
    <div class="card mb-4">
    
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_campaign.creator)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_campaign.goal.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</h2>
        <p class="card-text mt-0">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_campaign.pledged.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</span>
        </p>

        <div class="rating" data-id=${
          _campaign.index}>
          <i class="rating__star far fa-star" data-id="0"></i>
          <i class="rating__star far fa-star" data-id="1"></i>
          <i class="rating__star far fa-star" data-id="2"></i>
          <i class="rating__star far fa-star" data-id="3"></i>
          <i class="rating__star far fa-star" data-id="4"></i>
        </div>
        <p class="card-text mt-4" style="min-height: 30px" id=${
            _campaign.index}>
          ${_campaign.startAt}           
        </p>
        <p class="card-text mt-4" style="min-height: 30px" id=${
            _campaign.index}>
          ${_campaign.endAt}           
        </p>
    
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _campaign.index
          }>
            Buy for ${_campaign.pledged.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}


// Creates a small image called an identicon
function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

// display notification for users
function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

// hide notifications after it is displayed 
function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}


// renders our function after windows loads
window.addEventListener("load", async () => {
  notification("Loading...")
  await connectCeloWallet()
  await getBalance()
  await getCampaigns()
  notificationOff()
});


// listen to Add button then save new hospital in an array which is pushed to our smart contract
document
  .querySelector("#newHospitalBtn")
  .addEventListener("click", async (e) => {

    // collect form data in an array and pass as argument to smart contract
    const params = [
      document.getElementById("newHospitalName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newHospitalDescription").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString(),
    ]
    
    notification(`Adding "${params[0]}..."`)
    try {
      const result = await contract.methods
        .writeHospital(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`${error}.`)
    }
    notification(` You successfully added "${params[0]}".`)
    getCampaigns()
  })


  // listen to buy button and allows users to order ambulance
document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(2)
    } catch (error) {
      notification(`${error}.`)
    }
    notification(` Awaiting payment for order of ambulance from "${campaigns[index].name}..."`)
    try {
      const result = await contract.methods
        .pledge(1, 2)
        .send({ from: kit.defaultAccount })
      notification(`You successfully pledged.`)
      getCampaigns()
      getBalance()
    } catch (error) {
      notification(`${error}.`)
    }
  }
}) 

// allow users to search hospitals based on location
// document.querySelector('.btn-outline-success').addEventListener('click', (e) => {
//     e.preventDefault()
//     const searchValue = document.querySelector('.search-bar').value
//     const searchResult = hospitals.filter(hospital => {
//         if(hospital.location.toLowerCase() === searchValue.toLowerCase()) {
//             notificationOff();
//             return hospital;
//         } 
//     })

//     renderSearch(searchResult)

//     if(searchResult.length <= 0) { 

//       notification('result not found')
//   }
    
// })

// displays search result in the user interface
// function renderSearch(searchResult) {
//     document.getElementById("marketplace").innerHTML = ""
//     searchResult.forEach((_hospital) => {
//       const newDiv = document.createElement("div")
//       newDiv.className = "col-md-4"
//       newDiv.innerHTML = hospitalTemplate(_hospital)
//       document.getElementById("marketplace").appendChild(newDiv)
//     })
//   }

//   // notification after users uses the search field
// document.querySelector('.search-bar').addEventListener('input', (e) => {
//     // e.preventDefault()
//     if(e.target.value === ""){
//         notificationOff()
//         getHospitals()
//     }

// })


// allows users to rate hospitals
// document.querySelector('#marketplace').addEventListener('click', async (e) => {
  
//     if(e.target.className.includes('rating__star')) {
//       const ratingStars = [...e.target.parentElement.children]
    
//       ratingStars.forEach(star => {
        
//         if(star.dataset.id <= e.target.dataset.id){
          
//           star.classList.add('fas')
//           star.classList.remove('far')
//         } else if (star.dataset.id > e.target.dataset.id) {
//           star.classList.remove('fas')
//           star.classList.add('far')
//         }
//       })
//     }
// })

// write users rating to smart contract
// document
//   .querySelector("#marketplace")
//   .addEventListener("click", async (e) => {
//     if(e.target.className.includes('rating__star')) {
//       let id = e.target.parentElement.dataset.id;
      
//       let selectedRating = (Number(e.target.dataset.id) + 1);
  
//     try {
//       notification(`rating ambulance service ...`) 
//       const result = await contract.methods
//         .writeRating(id, selectedRating)
//         .send({ from: kit.defaultAccount })
//     } catch (error) {
//       notification(`${error}.`)
//     }
//     notification(`successfully rated ambulance service`)
//     getHospitals()
//     }
//   })