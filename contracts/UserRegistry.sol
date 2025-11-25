// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Реєстр користувачів BookSwap Club
contract UserRegistry {
    struct UserProfile {
        bool isRegistered;
        string nickname;
        string city;
        string favoriteGenres;
    }

    mapping(address => UserProfile) private users;

    event UserRegistered(address indexed user, string nickname);
    event UserUpdated(address indexed user, string nickname);

    /// @notice Створення профілю
    function register(
        string memory nickname,
        string memory city,
        string memory favoriteGenres
    ) external {
        require(!users[msg.sender].isRegistered, "Already registered");

        users[msg.sender] = UserProfile({
            isRegistered: true,
            nickname: nickname,
            city: city,
            favoriteGenres: favoriteGenres
        });

        emit UserRegistered(msg.sender, nickname);
    }

    /// @notice Оновлення даних профілю
    function updateProfile(
        string memory nickname,
        string memory city,
        string memory favoriteGenres
    ) external {
        require(users[msg.sender].isRegistered, "Not registered");

        users[msg.sender].nickname = nickname;
        users[msg.sender].city = city;
        users[msg.sender].favoriteGenres = favoriteGenres;

        emit UserUpdated(msg.sender, nickname);
    }

    /// @notice Перевірка, чи зареєстрований користувач
    function isRegistered(address user) external view returns (bool) {
        return users[user].isRegistered;
    }

    /// @notice Отримання повного профілю користувача
    function getUser(address user)
        external
        view
        returns (
            bool registered,
            string memory nickname,
            string memory city,
            string memory favoriteGenres
        )
    {
        UserProfile storage u = users[user];
        return (u.isRegistered, u.nickname, u.city, u.favoriteGenres);
    }
}
