require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/QwZDoBlSffj8AJ5elPQGVTgutuX2QiU9',
      accounts: ['cf7d81e442eb3bf239edbc3020b4df8c182d37dc4b31a5e20c96732ce42b1c1a']
    }
  }
};
