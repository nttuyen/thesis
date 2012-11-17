/**
 * 
 */
package com.nttuyen.web.core;

import java.io.File;
import java.util.LinkedList;
import java.util.Properties;
import com.nttuyen.util.ConfigUtil;

/**
 * @author nttuyen
 *
 */
public class SystemLoader {
	//private static final String folderConfig = "/home/sites/nttuyen/thesis/thesis-deploy/config";
	private String folderConfig = "";
	private Properties config = null;
    private static SystemLoader loader = null;

    private SystemLoader() {
    }
    public static SystemLoader getInstance() {
        if(loader == null) {
            loader = new SystemLoader();
        }
        return loader;
    }

    public void setFolderConfig(String folderConfig) {
        this.folderConfig = folderConfig;
    }

	public static Properties systemConfig() {
        return getInstance().loadConfig();
	}

    private Properties loadConfig() {
        if(this.config == null || this.config.isEmpty()) {
            File file = new File(folderConfig);
            LinkedList<String> files = new LinkedList<String>();
            if(file.exists() && file.isDirectory()) {
                File[] fs = file.listFiles();
                for(File f : fs) {
                    if(f.isFile()){
                        files.add(f.getAbsolutePath());
                    }
                }
            }
            if(files.isEmpty()) {
                return null;
            }
            this.config = ConfigUtil.load(config, files.toArray(new String[0]));
        }
        return this.config;
    }
}
