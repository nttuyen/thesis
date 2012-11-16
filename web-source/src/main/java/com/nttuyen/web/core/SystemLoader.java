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
	private static final String folderConfig = "C:\\Users\\nttuyen\\Desktop\\thesis\\web\\src\\main\\webapp\\WEB-INF\\config";
	private static Properties config = null;
	public static Properties systemConfig() {
		if(config == null) {
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
			config = ConfigUtil.load(config, files.toArray(new String[0]));
		}
		return config;
	}
}
