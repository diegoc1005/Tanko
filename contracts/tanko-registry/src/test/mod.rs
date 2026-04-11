#![cfg(test)]

use super::TankoRegistry;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

#[test]
fn test_init_and_verify() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TankoRegistry);
    let client = TankoRegistryClient::new(&env, &contract_id);

    let admin = Address::random(&env);
    let driver = Address::random(&env);
    let station = Address::random(&env);

    client.init(&admin);

    client.add_driver(&admin, &driver);
    client.add_station(&admin, &station);

    let is_verified = client.verify_tx(&driver, &station);
    assert!(is_verified);
}

#[test]
fn test_verify_without_registration() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TankoRegistry);
    let client = TankoRegistryClient::new(&env, &contract_id);

    let admin = Address::random(&env);
    let driver = Address::random(&env);
    let station = Address::random(&env);

    client.init(&admin);

    let is_verified = client.verify_tx(&driver, &station);
    assert!(!is_verified);
}

#[test]
fn test_remove_driver() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TankoRegistry);
    let client = TankoRegistryClient::new(&env, &contract_id);

    let admin = Address::random(&env);
    let driver = Address::random(&env);
    let station = Address::random(&env);

    client.init(&admin);
    client.add_driver(&admin, &driver);
    client.add_station(&admin, &station);

    assert!(client.verify_tx(&driver, &station));

    client.remove_driver(&admin, &driver);

    assert!(!client.verify_tx(&driver, &station));
}

#[test]
fn test_unauthorized_admin() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TankoRegistry);
    let client = TankoRegistryClient::new(&env, &contract_id);

    let admin = Address::random(&env);
    let wrong_admin = Address::random(&env);
    let driver = Address::random(&env);

    client.init(&admin);

    let result = client.try_add_driver(&wrong_admin, &driver);
    assert!(result.is_err());
}
