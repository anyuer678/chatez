package com.chatez.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 让 WebView 延伸到 status bar / navigation bar 区域（米黄色填充）
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // 0xFFFAF3E0 = 完全不透明 + #faf3e0（alpha=0x00 会导致完全透明，系统白色背景透出形成白条）
        getWindow().setStatusBarColor(0xFFFAF3E0);
        getWindow().setNavigationBarColor(0xFFFAF3E0);

        // 让状态栏图标为深色（适用于浅色背景）
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decor = getWindow().getDecorView();
            int flags = decor.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            decor.setSystemUiVisibility(flags);
        }
    }
}
