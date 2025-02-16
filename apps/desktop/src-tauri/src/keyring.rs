use keyring::Entry;

const SERVICE_NAME: &str = "focu";

/// Store an API key
#[tauri::command]
pub async fn store_api_key(key_name: String, api_key: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key_name).map_err(|e| e.to_string())?;
    entry.set_password(&api_key).map_err(|e| e.to_string())?;
    Ok(())
}

/// Retrieve an API key
#[tauri::command]
pub async fn get_api_key(key_name: String) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, &key_name).map_err(|e| e.to_string())?;

    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Delete an API key
#[tauri::command]
pub async fn delete_api_key(key_name: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key_name).map_err(|e| e.to_string())?;

    match entry.delete_password() {
        Ok(_) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // Already deleted is fine
        Err(e) => Err(e.to_string()),
    }
}
