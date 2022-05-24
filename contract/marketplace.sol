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

contract Marketplace {

    uint internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint price;
        uint sold;
    }

    mapping (uint => Product) internal products;

    function writeProduct(
        string memory _name,
        string memory _image,
        string memory _description, 
        string memory _location, 
        uint _price
    ) public {
        uint _sold = 0;
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _price,
            _sold
        );
        productsLength++;
    }

    function readProduct(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory, 
        string memory, 
        uint, 
        uint
    ) {
        return (
            products[_index].owner,
            products[_index].name, 
            products[_index].image, 
            products[_index].description, 
            products[_index].location, 
            products[_index].price,
            products[_index].sold
        );
    }
    
    function buyProduct(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            products[_index].owner,
            products[_index].price
          ),
          "Transfer failed."
        );
        products[_index].sold++;
    }
    
    function getProductsLength() public view returns (uint) {
        return (productsLength);
    }
}







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

    uint internal productsLength = 0;
    uint internal likes;
    uint number;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
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

    mapping (uint => Product) internal products;
    mapping (uint => Rating) internal ratings;

    function writeProduct(
        string memory _name,
        string memory _image,
        string memory _location,
        uint _price
    ) public {
        uint _rating = 10;
        uint _services = 0;
        products[productsLength] = Product(
            payable(msg.sender),
			_name,
			_image,
			_location,
			_price,
			_rating,
			_services
        );

        productsLength++;
    }

    function readProduct(uint _index) public view returns (
		address payable,
		string memory, 
		string memory, 
		string memory, 
		uint, 
		uint,
		uint
	) {
		return (
			products[_index].owner, 
			products[_index].name, 
			products[_index].image, 
			products[_index].location, 
			products[_index].price,
			products[_index].rating,
			products[_index].services
		);
	}


    function orderAmbulance(uint _index) public payable {
        require(
                IERC20Token(cUsdTokenAddress).transferFrom(
                    msg.sender,
                    products[_index].owner,
                    products[_index].price
            ),
            "Transfer failed"
        );
        products[_index].services++;
    }


    function getProductsLength() public view returns (uint) {
        return (productsLength);
    } 

    
    // function like (uint _index) public {

    //     products[_index].rating += products[_index].rating / 
    //     products[_index].rating++;
    // }

    function writeRating(
        uint _rate,
        uint _numberOfRate,
        uint _average
    ) public {
        uint _rate = 0;
        uint _numberOfRate = 0;
        uint _average = 0;

        ratings[productsLength] = Rating (
            payable(msg.sender),
            _rate,
            _numberOfRate,
            _average
        )
    }

    function readRating(uint _index, uint _selectedRate) public (
        address payable,
        uint,
        uint,
        uint
    ) {
        ratings[_index].rate += selectedRate;
        numberOfRate[_index].rate++;
        average[_index].rate = selectedRate/numberOfRate;

        products[_index].rating = average[_index].rate;

        
    }

     
}

