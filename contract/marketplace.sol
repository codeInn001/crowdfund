// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}



contract AmbuMarketPlace {

    uint internal hospitalsLength = 0;
    uint internal likes;
    uint number;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Hospital {
        address payable owner;
        string name;
        string image;
        string location;
        uint price;
        uint rating;
        uint services;
            
    }

    struct Rating {
        address payable sender;
        uint rate;
        uint numberOfRate;
        uint average;
    }

    mapping (uint => Hospital) internal hospitals;
    mapping (uint => Rating) internal ratings;


// write each hospital as a struct into our map
    function writeHospital(
        string memory _name,
        string memory _image,
        string memory _location,
        uint _price
    ) public {
        uint _rating = 0;
        uint _services = 0;
        hospitals[hospitalsLength] = Hospital(
            payable(msg.sender),
			_name,
			_image,
			_location,
			_price,
			_rating,
			_services
        );

        hospitalsLength++;
    }

// returns each hospitals and their properties
    function readHospital(uint _index) public view returns (
		address payable,
		string memory, 
		string memory, 
		string memory, 
		uint, 
		uint,
		uint
	) {
		return (
			hospitals[_index].owner, 
			hospitals[_index].name, 
			hospitals[_index].image, 
			hospitals[_index].location, 
			hospitals[_index].price,
			hospitals[_index].rating,
			hospitals[_index].services
		);
	}

// orders ambulance and increases services for each order
    function orderAmbulance(uint _index) public payable {
        require(
                IERC20Token(cUsdTokenAddress).transferFrom(
                    msg.sender,
                    hospitals[_index].owner,
                    hospitals[_index].price
            ),
            "Transfer failed"
        );
        hospitals[_index].services++;
    }

// returnds number of hospital services available
    function getHospitalsLength() public view returns (uint) {
        return (hospitalsLength);
    } 

// write rating for each hospital
    function writeRating(uint _index, uint _selectedRate) public {
        uint _rate = 0;
        uint _numberOfRate = 0;
        uint _average = 0;

        ratings[_index] = Rating (
            payable(msg.sender),
            _rate,
            _numberOfRate,
            _average
        );

        ratings[_index].rate += _selectedRate;
        ratings[_index].numberOfRate++;
        ratings[_index].average = ratings[_index].rate/ratings[_index].numberOfRate;
        hospitals[_index].rating = ratings[_index].average;

    }

// returns rating for each hospital
    function readRating(uint _index) public view returns (uint) {

		return (
			hospitals[_index].rating
			);
	}

}

