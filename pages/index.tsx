import dayjs from "dayjs";

import {
  Box,
  Button,
  Center,
  Flex,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { HeaderSimple } from "../components/header";

import SHA256 from "crypto-js/sha256";
import { getCookie } from "cookies-next";
import { useForceUpdate } from "@mantine/hooks";

class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: Transaction[];
  public miningReward: number;
  public changeDifficultyOnMultiple: number;

  constructor({ difficulty, genesisTimestamp = Date.now() }) {
    this.chain = [this.createGenesisBlock(genesisTimestamp)];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.miningReward = 5;
    this.changeDifficultyOnMultiple = 100;
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  handleDifficultyChange() {
    console.log("Difficulty increased");
    this.difficulty += 1;
    this.miningReward -= 1;
  }

  createGenesisBlock(genesisTimestamp) {
    return new Block({
      timestamp: genesisTimestamp,
      transactions: [],
      previousHash: "0",
    });
  }

  isValidChain() {
    for (let index = 1; index < this.chain.length; index++) {
      const currentBlock = this.chain[index];
      const previousBlock = this.chain[index - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      return true;
    }
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block({
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      previousHash: this.lastBlock.hash,
    });

    block.mine(this.difficulty);

    console.log("Block successfully mined!");

    this.chain.push(block);

    if (this.chain.length % this.changeDifficultyOnMultiple === 0) {
      this.handleDifficultyChange();
    }

    this.pendingTransactions = [
      new Transaction({
        fromAddress: null,
        toAddress: miningRewardAddress,
        amount: this.miningReward,
      }),
    ];
  }

  getBalanceForAddress(address) {
    return this.chain.reduce((balance, block) => {
      block.transactions.forEach((transaction) => {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      });

      return balance;
    }, 0);
  }
}

class Block {
  public previousHash: string;
  public timestamp: number;
  public transactions: Transaction[];
  public hash: string;
  public nonce: number;

  constructor({ previousHash = "", timestamp = Date.now(), transactions }) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      `${this.previousHash}${this.timestamp}${JSON.stringify(
        this.transactions
      )}${this.nonce}`
    ).toString();
  }

  mine(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined");
  }
}

class Transaction {
  public fromAddress: string;
  public toAddress: string;
  public amount: number;

  constructor({ fromAddress, toAddress, amount }) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

const myCoin = new Blockchain({ difficulty: 1 });

// [...Array(10)].forEach(() => {
//   myCoin.minePendingTransactions("abc");
// });

const links = [
  {
    link: "/api/oauth/google",
    label: "Log in",
  },
];

const IndexPage = () => {
  const [bitcoinBlockchain, setBitcoinBlockchain] = useState<Blockchain>();
  const [blockchainHasBeenCreated, setBlockchainHasBeenCreated] =
    useState(false);
  const [myWalletAddress, setMyWalletAddress] = useState("");
  const [transactionModalIsOpen, setTransactionModalIsOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState(0);
  const [modalToAddress, setModalToAddress] = useState("");

  const [viewTransactionsModalIsOpen, setViewTransactionsModalIsOpen] =
    useState(false);
  const [currentViewTransactionsModal, setCurrentViewTransactionsModal] =
    useState<number>();

  useEffect(() => {
    if (getCookie("address")) {
      // @ts-expect-error
      setMyWalletAddress(getCookie("address"));
    }
  }, []);
  const forceUpdate = useForceUpdate();

  return (
    <Box sx={{ width: "100vw" }}>
      <HeaderSimple links={links} />
      {!blockchainHasBeenCreated ? (
        <Center>
          <Button
            onClick={() => {
              const chain = new Blockchain({ difficulty: 1 });
              setBitcoinBlockchain(chain);
              setBlockchainHasBeenCreated(true);
            }}
          >
            Create blockchain
          </Button>
        </Center>
      ) : (
        <Box sx={{ width: "100vw", overflowX: "scroll" }}>
          <Flex p="1%" sx={{ width: "100%", overflowX: "auto" }}>
            {bitcoinBlockchain.chain.map((block, i) => {
              return (
                <>
                  {i !== 0 && (
                    <Center>
                      <Box sx={{ width: 50, height: 1, background: "black" }} />
                    </Center>
                  )}
                  <Center
                    key={i}
                    sx={{
                      boxSizing: "content-box",
                      padding: 15,
                      width: 300,
                      minWidth: 300,
                      minHeight: 300,
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      height: 300,
                      border: "1px solid gray",
                      borderRadius: 15,
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{}}>
                      <Text size="lg" sx={{ textOverflow: "ellipsis" }}>
                        <span style={{ fontWeight: 700 }}>Block Hash: </span>
                        {` ${block.hash.slice(0, 6)}...${block.hash.slice(-6)}`}
                      </Text>
                      <Text size="lg" sx={{ textOverflow: "ellipsis" }}>
                        <span style={{ fontWeight: 700 }}>Previous hash: </span>

                        {i !== 0
                          ? ` ${block.previousHash.slice(
                              0,
                              6
                            )}...${block.previousHash.slice(-6)}`
                          : block.previousHash}
                      </Text>
                      <Text size="lg" sx={{ textOverflow: "ellipsis" }}>
                        <span style={{ fontWeight: 700 }}>Nonce: </span>
                        {block.nonce}
                      </Text>
                      <Text size="lg" sx={{ textOverflow: "ellipsis" }}>
                        <span style={{ fontWeight: 700 }}>Timestamp: </span>
                        {Math.round(block.timestamp / 1000)}

                        <Text>
                          {" "}
                          <span style={{ fontWeight: 700 }}>Time:</span>{" "}
                          {dayjs(block.timestamp).format(
                            "MMM DD, YYYY, hh:mm:ss A"
                          )}
                        </Text>
                      </Text>
                    </Box>

                    <Modal
                      opened={
                        viewTransactionsModalIsOpen &&
                        i == currentViewTransactionsModal
                      }
                      withCloseButton={false}
                      onClose={() => {
                        setViewTransactionsModalIsOpen(false);
                        setCurrentViewTransactionsModal(-1);
                      }}
                      size="lg"
                      title={
                        <Title order={4} sx={{ fontWeight: 600 }}>
                          Transactions for block{" "}
                          {`${block.hash.slice(0, 6)}...${block.hash.slice(
                            -6
                          )}`}
                        </Title>
                      }
                    >
                      {!block.transactions.length ? (
                        <Center>
                          <Text>
                            There are no transactions in this block :(
                          </Text>
                        </Center>
                      ) : (
                        block.transactions.map(
                          (transaction, j) =>
                            transaction.fromAddress && (
                              <Center
                                key={j}
                                mt={3}
                                p={10}
                                sx={{
                                  justifyContent: "space-between",
                                  border: "1px solid gray",
                                  borderRadius: 5,
                                }}
                              >
                                <Box sx={{}}>
                                  <Text weight={700} size="md">
                                    #{" "}
                                  </Text>
                                  <Text size="md">{j}</Text>
                                </Box>
                                <Box sx={{}}>
                                  <Text weight={700} size="md">
                                    Amount:{" "}
                                  </Text>
                                  <Text size="md">
                                    {transaction.amount} BTC
                                  </Text>
                                </Box>
                                <Box>
                                  <Text weight={700} size="md">
                                    From address:{" "}
                                  </Text>
                                  <Text size="md">
                                    {console.log(transaction)}
                                    {`${transaction.fromAddress.slice(
                                      0,
                                      8
                                    )}...${transaction.fromAddress.slice(-8)}`}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text weight={700} size="md">
                                    To address:{" "}
                                  </Text>
                                  <Text size="md">
                                    {`${transaction.toAddress.slice(
                                      0,
                                      8
                                    )}...${transaction.toAddress.slice(-8)}`}
                                  </Text>
                                </Box>
                              </Center>
                            )
                        )
                      )}
                    </Modal>

                    <Button
                      mt="auto"
                      onClick={() => {
                        setViewTransactionsModalIsOpen(true);
                        setCurrentViewTransactionsModal(i);
                      }}
                    >
                      View transactions
                    </Button>
                  </Center>
                </>
              );
            })}
          </Flex>
          <Button
            onClick={() => {
              bitcoinBlockchain.minePendingTransactions(myWalletAddress);

              forceUpdate();
            }}
          >
            Mine block
          </Button>
          <Modal
            opened={transactionModalIsOpen}
            onClose={() => setTransactionModalIsOpen(false)}
            withCloseButton={false}
          >
            <TextInput
              onChange={(e) => {
                setModalToAddress(e.currentTarget.value);
              }}
              placeholder="e.g. d9411a290c6205c1e2f129c6332119f175b0f4f3a70857761d79ec736cafc8a9"
              label="To address"
              withAsterisk
            />
            <NumberInput
              onChange={(e) => {
                setModalAmount(Number(e));
              }}
              placeholder="e.g. 10"
              label="Amount"
              withAsterisk
            />
            <Flex justify="flex-end">
              <Button
                mt={10}
                onClick={() => {
                  const newTransaction = new Transaction({
                    amount: modalAmount,
                    toAddress: modalToAddress,
                    fromAddress: myWalletAddress,
                  });
                  bitcoinBlockchain.createTransaction(newTransaction);
                  forceUpdate();
                  setTransactionModalIsOpen(false);
                }}
              >
                Send
              </Button>
            </Flex>
          </Modal>
          <Button
            ml={10}
            color="teal"
            onClick={() => {
              setTransactionModalIsOpen(true);
            }}
          >
            Create new transaction
          </Button>
          <Button
            ml={10}
            color="violet"
            onClick={() => {
              const balance =
                bitcoinBlockchain.getBalanceForAddress(myWalletAddress);
            }}
          >
            Get my balance
          </Button>
        </Box>
      )}
    </Box>
  );
};
export default IndexPage;
