use {
    soul_sanctuary::{
        instruction::SOuLInstruction,
        processor::process_instruction,
        state::{SOuLToken, LSTToken},
    },
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
    },
    solana_program_test::*,
    solana_sdk::{
        account::Account,
        signature::{Keypair, Signer},
        transaction::Transaction,
    },
};

#[tokio::test]
async fn test_soul_token_initialization() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "soul_sanctuary",
        program_id,
        processor!(process_instruction),
    );

    let token_account = Keypair::new();
    let initializer = Keypair::new();
    let total_supply = 1_000_000_000;

    program_test.add_account(
        token_account.pubkey(),
        Account {
            lamports: 5000000,
            data: vec![0; 1000],
            owner: program_id,
            ..Account::default()
        },
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    let mut transaction = Transaction::new_with_payer(
        &[Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(initializer.pubkey(), true),
                AccountMeta::new(token_account.pubkey(), false),
            ],
            data: SOuLInstruction::InitializeSOuL {
                total_supply,
            }
            .try_to_vec()
            .unwrap(),
        }],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer, &initializer], recent_blockhash);

    banks_client.process_transaction(transaction).await.unwrap();
}

#[tokio::test]
async fn test_lst_token_initialization() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "soul_sanctuary",
        program_id,
        processor!(process_instruction),
    );

    let token_account = Keypair::new();
    let initializer = Keypair::new();
    let total_supply = 1_000_000;
    let token_type = 1; // forestSOuL

    program_test.add_account(
        token_account.pubkey(),
        Account {
            lamports: 5000000,
            data: vec![0; 1000],
            owner: program_id,
            ..Account::default()
        },
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    let mut transaction = Transaction::new_with_payer(
        &[Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(initializer.pubkey(), true),
                AccountMeta::new(token_account.pubkey(), false),
            ],
            data: SOuLInstruction::InitializeLST {
                token_type,
                total_supply,
            }
            .try_to_vec()
            .unwrap(),
        }],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer, &initializer], recent_blockhash);

    banks_client.process_transaction(transaction).await.unwrap();
}
