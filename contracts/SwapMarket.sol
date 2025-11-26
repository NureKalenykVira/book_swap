// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BookNFT.sol";
import "./UserRegistry.sol";

/// @title Ринок обміну книжками BookSwap Club
contract SwapMarket {
    struct SwapOffer {
        uint256 id;
        address owner;
        uint256 bookId;
        bool isActive;
    }

    struct SwapRequest {
        uint256 id;
        uint256 offerId;
        address requester;
        uint256 offeredBookId;
        bool isPending;
    }

    uint256 private _nextOfferId;
    uint256 private _nextRequestId;

    mapping(uint256 => SwapOffer) public offers;
    mapping(uint256 => SwapRequest) public requests;
    mapping(uint256 => uint256[]) public offerRequests;

    BookNFT public bookContract;
    UserRegistry public userRegistry;

    event OfferCreated(uint256 indexed offerId, address indexed owner, uint256 indexed bookId);
    event OfferCancelled(uint256 indexed offerId);

    event RequestCreated(
        uint256 indexed requestId,
        uint256 indexed offerId,
        address indexed requester,
        uint256 offeredBookId
    );
    event RequestCancelled(uint256 indexed requestId);

    event SwapCompleted(
        uint256 indexed offerId,
        uint256 indexed requestId,
        address owner,
        address requester
    );

    constructor(address bookContractAddress, address userRegistryAddress) {
        bookContract = BookNFT(bookContractAddress);
        userRegistry = UserRegistry(userRegistryAddress);
    }

    modifier onlyRegistered() {
        require(userRegistry.isRegistered(msg.sender), "User not registered");
        _;
    }

    /// @notice Створення оферу на обмін власної книжки
    function createOffer(uint256 bookId) external onlyRegistered returns (uint256 offerId) {
        require(bookContract.ownerOf(bookId) == msg.sender, "Not owner of book");

        _nextOfferId += 1;
        offerId = _nextOfferId;

        offers[offerId] = SwapOffer({
            id: offerId,
            owner: msg.sender,
            bookId: bookId,
            isActive: true
        });

        emit OfferCreated(offerId, msg.sender, bookId);
    }

    /// @notice Скасування власного оферу
    function cancelOffer(uint256 offerId) external {
        SwapOffer storage offer = offers[offerId];
        require(offer.owner == msg.sender, "Not offer owner");
        require(offer.isActive, "Offer not active");

        offer.isActive = false;
        emit OfferCancelled(offerId);
    }

    /// @notice Створення запиту (запропонувати свою книжку у відповідь на офер)
    function createRequest(uint256 offerId, uint256 myBookId)
        external
        onlyRegistered
        returns (uint256 requestId)
    {
        SwapOffer storage offer = offers[offerId];
        require(offer.isActive, "Offer not active");
        require(offer.owner != msg.sender, "Cannot request own offer");
        require(bookContract.ownerOf(myBookId) == msg.sender, "Not owner of offered book");

        _nextRequestId += 1;
        requestId = _nextRequestId;

        requests[requestId] = SwapRequest({
            id: requestId,
            offerId: offerId,
            requester: msg.sender,
            offeredBookId: myBookId,
            isPending: true
        });

        offerRequests[offerId].push(requestId);

        emit RequestCreated(requestId, offerId, msg.sender, myBookId);
    }

    /// @notice Відміна власного запиту на обмін
    function cancelRequest(uint256 requestId) external {
        SwapRequest storage req = requests[requestId];
        require(req.requester == msg.sender, "Not requester");
        require(req.isPending, "Request not pending");

        req.isPending = false;
        emit RequestCancelled(requestId);
    }

    /// @notice Прийняття запиту власником оферу та виконання обміну книжками
    function acceptRequest(uint256 requestId) external {
        SwapRequest storage req = requests[requestId];
        require(req.isPending, "Request not pending");

        SwapOffer storage offer = offers[req.offerId];
        require(offer.isActive, "Offer not active");
        require(msg.sender == offer.owner, "Only offer owner");

        require(bookContract.ownerOf(offer.bookId) == offer.owner, "Offer book owner changed");
        require(
            bookContract.ownerOf(req.offeredBookId) == req.requester,
            "Request book owner changed"
        );

        bookContract.safeTransferFrom(offer.owner, req.requester, offer.bookId);
        bookContract.safeTransferFrom(req.requester, offer.owner, req.offeredBookId);

        offer.isActive = false;
        req.isPending = false;

        emit SwapCompleted(offer.id, req.id, offer.owner, req.requester);
    }

    /// @notice Отримати офер за ідентифікатором (зручно для фронту)
    function getOffer(uint256 offerId) external view returns (SwapOffer memory) {
        return offers[offerId];
    }

    /// @notice Отримати запит за ідентифікатором (зручно для фронту)
    function getRequest(uint256 requestId) external view returns (SwapRequest memory) {
        return requests[requestId];
    }

    /// @notice Отримати список ідентифікаторів запитів для оферу
    function getRequestsForOffer(uint256 offerId) external view returns (uint256[] memory) {
        return offerRequests[offerId];
    }

    /// @notice Отримати всі офери (можна фільтрувати активні на фронті)
    function getAllOffers() external view returns (SwapOffer[] memory) {
        uint256 total = _nextOfferId;
        SwapOffer[] memory result = new SwapOffer[](total);

        for (uint256 i = 1; i <= total; i++) {
            result[i - 1] = offers[i];
        }

        return result;
    }

    /// @notice Отримати всі офери, створені конкретним користувачем
    function getOffersByOwner(address owner)
        external
        view
        returns (SwapOffer[] memory)
    {
        uint256 total = _nextOfferId;
        uint256 count = 0;

        // рахуємо кількість оферів власника
        for (uint256 i = 1; i <= total; i++) {
            if (offers[i].owner == owner) {
                count++;
            }
        }

        SwapOffer[] memory result = new SwapOffer[](count);
        uint256 idx = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (offers[i].owner == owner) {
                result[idx] = offers[i];
                idx++;
            }
        }

        return result;
    }
}
