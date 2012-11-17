/**
 * 
 */
package com.nttuyen.web.thesis.action;

import java.io.File;
import java.util.LinkedList;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.nttuyen.persistence.PersistenceException;
import org.apache.log4j.Logger;
import com.nttuyen.persistence.Persistence;
import com.nttuyen.persistence.Persistences;
import com.nttuyen.thesis.model.Music;
import com.nttuyen.thesis.util.Auth;
import com.nttuyen.web.core.Action;
import com.nttuyen.web.core.FormUtil;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class MusicAction implements Action{
	
	private static final Logger log = Logger.getLogger(MusicAction.class);

	
	public String execute(HttpServletRequest request,
			HttpServletResponse response, String... param) {
		if(param.length > 0) {
			if("add".equalsIgnoreCase(param[0])) {
				return add(request, response, param);
			}
			if("edit".equalsIgnoreCase(param[0])) {
				return edit(request, response, param);
			}
			if("remove".equalsIgnoreCase(param[0])) {
				return remove(request, response, param);
			}
			if("detail".equalsIgnoreCase(param[0])){
				return detail(request, response, param);
			}
		}
		return null;
	}
	
	private String add(HttpServletRequest request, HttpServletResponse response, String... param) {
		if(param.length > 1) {
			return null;
		}
		final Properties cfg = SystemLoader.systemConfig();
		String[] error = {};
		log.info("ADD music Method: " + request.getMethod());
		if(request.getMethod().equalsIgnoreCase("GET")) {
			request.setAttribute(cfg.getProperty("music.add.error"), error);
			return "music_add.jsp";
		}
		
		Music music = new Music();
		FormUtil.formToObject(request, music);
		
		error = valid(music);
		if(error == null || error.length == 0){
			Persistence persistence = Persistences.getPersistence(SystemLoader.systemConfig());
            try {
                persistence.save(music);
            } catch (PersistenceException e) {
                log.error("Exception when save music", e);
            }

            long id = music.getId();
			String media = music.getMedia();
			File f = new File(cfg.get("media.upload.folder") + File.separator + Auth.user(request) + "_" + media);
			if(f.exists()) {
				String newMedia = id + "_" + media;
				f.renameTo(new File(cfg.get("media.folder") + File.separator + newMedia));
			}
			request.setAttribute(cfg.getProperty("request.completed.forward"), "Upload ban nhac thanh cong");
			request.setAttribute(cfg.getProperty("request.site.forward"), cfg.get("site.url") + "/a/music/add");
			request.setAttribute(cfg.getProperty("html.title"), "upload completed");
			return "forward.jsp";
		} else {
			request.setAttribute(cfg.getProperty("music.add.error"), error);
			return "music_add.jsp";
		}
	}
	
	
	private String edit(HttpServletRequest request, HttpServletResponse response, String... param) {
		if(param.length > 1) {
			return null;
		}
		
		final Properties cfg = SystemLoader.systemConfig();
		String[] error = {};
		
		if(request.getMethod().equalsIgnoreCase("GET")) {
			request.setAttribute(cfg.getProperty("music.add.error"), error);
			Music music = new Music(); 
			FormUtil.formToObject(request, music);
			log.info("MusicID: " +  music.getId());
			Persistence persistence = Persistences.getPersistence(SystemLoader.systemConfig());
			music = persistence.getObjectByID(Music.class, music.getId());
			request.setAttribute(cfg.getProperty("request.music.edit"), music);
			return "music_edit.jsp";
		}
		
		Music music = new Music();
		FormUtil.formToObject(request, music);
		
		error = valid(music);
		if(error == null || error.length == 0) {
			Persistence persistence = Persistences.getPersistence(cfg);
            try {
                persistence.save(music);
            } catch (PersistenceException e) {
                log.error("Exception when save music", e);
            }
			
			long id = music.getId();
			String media = music.getMedia();
			File f = new File(cfg.get("media.upload.folder") + File.separator + Auth.user(request) + "_" + media);
			if(f.exists()) {
				String newMedia = id + "_" + media;
				File fileNew = new File(cfg.get("media.folder") + File.separator + newMedia);
				if(fileNew.exists()) {
					fileNew.delete();
				}
				f.renameTo(fileNew);
			}
			
			request.setAttribute(cfg.getProperty("request.completed.forward"), "Edit completed");
			request.setAttribute(cfg.getProperty("request.site.forward"), cfg.get("site.url") + "/a/music/add");
			request.setAttribute(cfg.getProperty("html.title"), "upload completed");
			return "forward.jsp";
		}
		
		request.setAttribute(cfg.getProperty("music.add.error"), error);
		return "music_edit.jsp";
	}
	
	private String remove(HttpServletRequest request, HttpServletResponse response, String... param) {
		Properties cfg = SystemLoader.systemConfig();
		Music music = new Music();
		FormUtil.formToObject(request, music);
		Persistence persistence = Persistences.getPersistence(cfg);
        try {
            persistence.remove(music);
        } catch (PersistenceException e) {
            log.error("Exception when remove music", e);
        }

        request.setAttribute(cfg.getProperty("request.completed.forward"), "Deleted!");
		//request.setAttribute(cfg.get("request.site.forward"), cfg.get("site.url") + "/a/music/add");
		request.setAttribute(cfg.getProperty("html.title"), "deleted");
		return "forward.jsp";
	}
	
	private String detail(HttpServletRequest request, HttpServletResponse response, String... param) {
		return null;
	}

	private String[] valid(Music music) {
		LinkedList<String> list = new LinkedList<String>();
		if(music.getName() == null || "".equals(music.getName())) {
			list.add("you must enter music name");
		}
		if(music.getMedia() == null || "".equals(music.getMedia()) || !music.getMedia().endsWith(".mp3")) {
			list.add("You must upload file mp3");
		}
		if(music.getType() == null) {
			music.setType("");
		}
		if(music.getAuthor() == null) {
			music.setAuthor("");
		}
		if(music.getSinger() == null) {
			music.setSinger("");
		}
		if(music.getAlbum() == null) {
			music.setAlbum("");
		}
		if(music.getLyrics() == null) {
			music.setLyrics("");
		}
		return list.toArray(new String[0]);
	}
}
