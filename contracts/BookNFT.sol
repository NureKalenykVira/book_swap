// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NFT-представлення книжок
contract BookNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct BookData {
        string title;
        string author;
        string genre;
        string description;
    }

    mapping(uint256 => BookData) public books;

    event BookMinted(address indexed owner, uint256 indexed tokenId, string title);

    constructor() ERC721("BookNFT", "BOOK") Ownable(msg.sender) {}

    /// @notice Карбування нової книжки у вигляді NFT
    function mintBook(
        string memory title,
        string memory author,
        string memory genre,
        string memory description,
        string memory metadataURI
    ) external returns (uint256 tokenId) {
        _tokenIdCounter += 1;
        tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);

        _setTokenURI(tokenId, metadataURI);

        books[tokenId] = BookData({
            title: title,
            author: author,
            genre: genre,
            description: description
        });

        emit BookMinted(msg.sender, tokenId, title);
    }

    /// @notice Повертає інформацію про книжку, її власника та URI
    function getBook(uint256 tokenId)
        external
        view
        returns (
            BookData memory data,
            address owner,
            string memory tokenURIString
        )
    {
        require(_ownerOf(tokenId) != address(0), "Book does not exist");

        data = books[tokenId];
        owner = ownerOf(tokenId);
        tokenURIString = tokenURI(tokenId);
    }
}
