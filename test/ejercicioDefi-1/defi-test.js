const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Excercise", function () {
    let deployer, alice, bob, charlie;

  beforeEach(async function () {
    [deployer, alice, bob, charlie] = await ethers.getSigners();

    //Deploying the SCT contract (ERC20)
    const Token = await ethers.getContractFactory("ErcToken");
    this.sctToken = await Token.deploy("Scamm Token", "SCT", ethers.utils.parseEther('10000000'));
    await this.sctToken.deployed();

    //Deploying the DAI contract (ERC20)
    this.daiToken = await Token.deploy("DAI Token", "DAI", ethers.utils.parseEther('10000000'));
    await this.daiToken.deployed();

    //Deploying the Registry contract
    const Registry = await ethers.getContractFactory("Registry");
    this.registry = await Registry.deploy();
    await this.registry.deployed();

    //Creating the SCT-ETH Liquidity Pool
    await this.registry.createExchange(this.sctToken.address);
    
    let sctExchangeAddress = await this.registry.getExchange(this.sctToken.address);
    this.sctExchange = await ethers.getContractAt("Exchange", sctExchangeAddress);

    //Creating the DAI-ETH Liquidity Pool
    await this.registry.createExchange(this.daiToken.address);
    
    let daiExchangeAddress = await this.registry.getExchange(this.daiToken.address);
    this.daiExchange = await ethers.getContractAt("Exchange", daiExchangeAddress);
    
    //Adding liquidity to SCT-ETH exchange (Liquidity Pool)... Rate: 4000 SCT/ETH
    await this.sctToken.approve(this.sctExchange.address, ethers.utils.parseEther('100000'));
    await this.sctExchange.addLiquidity(ethers.utils.parseEther('100000'), { value: ethers.utils.parseEther('25') });

    //Adding liquidity to DAI-ETH exchange (Liquidity Pool)... Rate: 2000 SCT/ETH
    await this.daiToken.approve(this.daiExchange.address, ethers.utils.parseEther('100000'));
    await this.daiExchange.addLiquidity(ethers.utils.parseEther('100000'), { value: ethers.utils.parseEther('50') });
  });

  it("Adds Liquidity to SCT-ETH exchange", async function () {
    await this.sctToken.approve(this.sctExchange.address, ethers.utils.parseEther('100000'));
    await this.sctExchange.addLiquidity(ethers.utils.parseEther('100000'), { value: ethers.utils.parseEther('25') });

    expect(
      await ethers.provider.getBalance(this.sctExchange.address)
    ).to.eq(ethers.utils.parseEther('50'));
    
    expect(
      await this.sctToken.balanceOf(this.sctExchange.address)
    ).to.eq(ethers.utils.parseEther('200000'));

    expect(
      await this.sctExchange.balanceOf(deployer.address)
    ).to.eq(ethers.utils.parseEther('50'));
  });

  it("Removes liquidity from SCT-ETH exchange", async function () {
    await this.sctToken.approve(this.sctExchange.address, ethers.utils.parseEther('100000'));
    await this.sctExchange.addLiquidity(ethers.utils.parseEther('100000'), { value: ethers.utils.parseEther('25') });

    await this.sctExchange.removeLiquidity(ethers.utils.parseEther('50'));

    expect(
      await ethers.provider.getBalance(this.sctExchange.address)
    ).to.eq('0');
    
    expect(
      await this.sctToken.balanceOf(this.sctExchange.address)
    ).to.eq('0');

    expect(
      await this.sctExchange.balanceOf(deployer.address)
    ).to.eq('0');
  });

  it("Can't create a second SCT-ETH exchange", async function () {
    await expect(
      this.registry.createExchange(this.sctToken.address)
    ).to.be.revertedWith("exchange already exists");
  });

  it("Swaps ETH to SCT", async function () {
    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('35'), { value: ethers.utils.parseEther('0.01') });

    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('39.584324607455447642'));
  });

  it("Swaps SCT to ETH", async function () {
    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('35'), { value: ethers.utils.parseEther('0.01') });

    await this.sctToken.connect(bob).approve(this.sctExchange.address, ethers.utils.parseEther('40'));
    await this.sctExchange.connect(bob).tokenToEthSwap(ethers.utils.parseEther('39.584324607455447642'), ethers.utils.parseEther('0.0095'));

    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq('0');
  });

  it("Swaps SCT to DAI", async function () {
    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('35'), { value: ethers.utils.parseEther('0.01') });

    await this.sctToken.connect(bob).approve(this.sctExchange.address, ethers.utils.parseEther('40'));
    await this.sctExchange.connect(bob).tokenToTokenSwap(ethers.utils.parseEther('39.584324607455447642'), ethers.utils.parseEther('15'), this.daiToken.address);

    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq('0');

    expect(
      await this.daiToken.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('19.402369161227126964'));
  });

  it("Lets owner to change fees", async function () {
    await this.registry.changeExchangeFee(this.sctExchange.address, 25);

    //console.log(parseFloat(await this.sctExchange.fee()));

    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('20'), { value: ethers.utils.parseEther('0.01') });
    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('29.991002699190242927'));
  });

  it("Prevents to set a fee percentage out of zero-100 rank", async function () {
    await expect(
      this.registry.changeExchangeFee(this.sctExchange.address, 101)
    ).to.be.revertedWith("Fee value lower than 100 is required");
    
    //console.log(parseFloat(await this.sctExchange.fee()));
  });

  it("Prevents other users from changing fees", async function () {  
    await expect(
      this.registry.connect(bob).changeExchangeFee(this.sctExchange.address, 25)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it.skip("Prevents to create a new LP exchange when contract isn't ERC20", async function () {
    //registry.createExchange with a non ERC20 address as parameter
  });

  it.skip("Uses Bonding Curve", async function () {
    //Bob makes a first purchase
    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('35'), { value: ethers.utils.parseEther('0.01') });
    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('39.584324607455447642'));

    //Charlie makes a first purchase
    await this.sctExchange.connect(charlie).ethToTokenSwap(ethers.utils.parseEther('35'), { value: ethers.utils.parseEther('0.01') });
    expect(
      await this.sctToken.balanceOf(charlie.address)
    ).to.eq(ethers.utils.parseEther('39.552840546380528741'));

    //Charlie adds liquidity
    await this.sctToken.connect(charlie).approve(this.sctExchange.address, ethers.utils.parseEther('39.552840546380528741'));
    await this.sctExchange.connect(charlie).addLiquidity(ethers.utils.parseEther('39.552840546380528741'), { value: ethers.utils.parseEther('0.0099') });
    expect(
      await this.sctExchange.balanceOf(charlie.address)
    ).to.eq(ethers.utils.parseEther('0.009892086330935251'));

    //Alice makes a big swap affecting the balance
    await this.sctExchange.connect(alice).ethToTokenSwap(ethers.utils.parseEther('70000'), { value: ethers.utils.parseEther('87') });
    expect(
      await this.sctToken.balanceOf(alice.address)
    ).to.eq(ethers.utils.parseEther('77452.306111480487678511'));

    //Bob makes a second purchase, receiving much lower SCT for the same amount of ETH (total balance includes the SCT from previos order)
    await this.sctExchange.connect(bob).ethToTokenSwap(ethers.utils.parseEther('1.5'), { value: ethers.utils.parseEther('0.01') });
    expect(
      await this.sctToken.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('41.573173968867458044'));

    //Bob adds liquidity
    await this.sctToken.connect(bob).approve(this.sctExchange.address, ethers.utils.parseEther('2'));
    await this.sctExchange.connect(bob).addLiquidity(ethers.utils.parseEther('1.99'), { value: ethers.utils.parseEther('0.0099') });
    expect(
      await this.sctExchange.balanceOf(bob.address)
    ).to.eq(ethers.utils.parseEther('0.002209908538428508'));
    expect(
      await this.sctExchange.balanceOf(charlie.address)
    ).to.eq(ethers.utils.parseEther('0.009892086330935251'));

    //Charlie removes liquidity
    let balanceBeforeRemove = await ethers.provider.getBalance(charlie.address);
    expect(
      balanceBeforeRemove
    ).to.eq(ethers.utils.parseEther('9999.979921537179119741'));
    
    await this.sctExchange.connect(charlie).removeLiquidity(ethers.utils.parseEther('0.009892086330935251'));
    let balanceAfterRemove = await ethers.provider.getBalance(charlie.address);
    //Charlie receives +0.045 ETH compared to 0.01 originally invested in the pool
    expect(
      balanceAfterRemove
    ).to.eq(ethers.utils.parseEther('10000.024162601925513760'));

    //Charlie receives 8.9 SCT compared to 39.55 originally invested in the pool
    expect(
      await this.sctToken.balanceOf(charlie.address)
    ).to.eq(ethers.utils.parseEther('8.901777802611531130'));
  });

});