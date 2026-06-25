package com.brt.setting;

import com.brt.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService settingService;

    @GetMapping
    public Map<String, Object> getSettings(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return settingService.getAllSettings();
    }

    @PostMapping
    public Map<String, Object> updateSettings(@AuthenticationPrincipal JwtPrincipal principal, 
                                             @RequestBody Map<String, Object> updates) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return settingService.updateSettings(updates);
    }
}
