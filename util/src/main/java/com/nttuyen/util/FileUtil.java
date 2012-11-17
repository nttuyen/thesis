package com.nttuyen.util;

import java.io.File;
import java.util.regex.Pattern;

/**
 * Created with IntelliJ IDEA.
 * User: nttuyen
 * Date: 11/16/12
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */
public class FileUtil {
    /**
     * Validate a fileName
     * @param fileName
     * @return true if fileName contain only A-Z, a-z, and _ character. False with otherwise
     */
    public static String validateFileName(String fileName) {
        StringBuilder s = new StringBuilder();
        int length = fileName.length();
        for(int i = 0; i < length; i++) {
            char c = fileName.charAt(i);
            if(isChar(c)) {
                s.append(c);
            } else {
                s.append('_');
            }
        }
        return s.toString();
    }

    /**
     * Validate extension of file
     * @param fileName
     * @param ext - list of extension, each extension is separate by comma
     * @return return true if file is one extension in ext
     */
    public static boolean validExt(String fileName, String ext) {
        if(ext == null || "".equals(ext)) {
            return true;
        }
        Pattern p = Pattern.compile(",");
        String[] exts = p.split(ext);
        for(String e : exts) {
            if(fileName.endsWith("." + e)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check character that fileName can contain
     * @param c
     * @return
     */
    private static boolean isChar(char c) {
        if(c == '.') {
            return true;
        }
        if(c == '_') {
            return true;
        }
        if(c >= 'a' && c <= 'z') {
            return true;
        }
        if(c >= 'A' && c <= 'Z') {
            return true;
        }
        if(c >= '0' && c <= '9') {
            return true;
        }
        return false;
    }

    public static boolean mkdir(String path) {
        File f = new File(path);
        if(f.isDirectory()) {
            return true;
        }
        return f.mkdirs();
    }
}
