package com.brt.setting;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Map<String, Object> getAllSettings() {
        Map<String, Object> settings = new HashMap<>();
        
        // Load defaultCrop
        String defaultCrop = repository.findById("defaultCrop")
                .map(SystemSetting::getValue)
                .orElse("");
        settings.put("defaultCrop", defaultCrop);

        // Load purchaseCharges
        Map<String, String> purchaseCharges = repository.findById("purchaseCharges")
                .map(setting -> {
                    try {
                        return objectMapper.readValue(setting.getValue(), new TypeReference<Map<String, String>>() {});
                    } catch (Exception e) {
                        return new HashMap<String, String>();
                    }
                })
                .orElseGet(HashMap::new);
        settings.put("purchaseCharges", purchaseCharges);

        // Load salesCharges
        Map<String, String> salesCharges = repository.findById("salesCharges")
                .map(setting -> {
                    try {
                        return objectMapper.readValue(setting.getValue(), new TypeReference<Map<String, String>>() {});
                    } catch (Exception e) {
                        return new HashMap<String, String>();
                    }
                })
                .orElseGet(HashMap::new);
        settings.put("salesCharges", salesCharges);

        return settings;
    }

    @Transactional
    public void saveSetting(String key, Object value) {
        try {
            String stringValue;
            if (value instanceof String) {
                stringValue = (String) value;
            } else {
                stringValue = objectMapper.writeValueAsString(value);
            }
            SystemSetting setting = new SystemSetting(key, stringValue);
            repository.save(setting);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save setting: " + key, e);
        }
    }

    @Transactional
    public Map<String, Object> updateSettings(Map<String, Object> updates) {
        if (updates.containsKey("defaultCrop")) {
            saveSetting("defaultCrop", updates.get("defaultCrop"));
        }
        if (updates.containsKey("purchaseCharges")) {
            saveSetting("purchaseCharges", updates.get("purchaseCharges"));
        }
        if (updates.containsKey("salesCharges")) {
            saveSetting("salesCharges", updates.get("salesCharges"));
        }
        return getAllSettings();
    }
}
