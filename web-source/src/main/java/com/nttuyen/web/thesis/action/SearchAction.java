/**
 * 
 */
package com.nttuyen.web.thesis.action;

import java.util.Iterator;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import com.nttuyen.dao.Persistence;
import com.nttuyen.dao.Persistences;
import com.nttuyen.dao.query.QueryUtil;
import com.nttuyen.thesis.model.Music;
import com.nttuyen.thesis.model.Predict;
import com.nttuyen.thesis.util.Auth;
import com.nttuyen.web.core.Action;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class SearchAction implements Action{

	private static final Logger log = Logger.getLogger(SearchAction.class);
	
	public String execute(HttpServletRequest request,
			HttpServletResponse response, String... param) {
		final Properties cfg = SystemLoader.systemConfig();
		
		String searchType = "";
		String searchKey = "";
		if(param.length > 0) {
			searchType = param[0];
		} 
		
		if("".equals(searchType)) {
			searchType = request.getParameter("type");
		}
		if(searchType == null) {
			searchType = "newest";
		}
		
		if(!"recommended-hottest-newest-name-author-singer-type".contains(searchType)) {
			searchType = "newest";
		}
		
		if(param.length >= 2) {
			searchKey = param[1];
		} else {
			searchKey = request.getParameter("key");
			if(searchKey != null) {
				if("".equals(searchKey)) {
					searchType = "newest";
				}
				request.setAttribute(cfg.getProperty("request.completed.forward"), "forward");
				request.setAttribute(cfg.getProperty("request.site.forward"), cfg.getProperty("site.url") + "/a/search/" + searchType + "/" + searchKey);
				return "forward.jsp";
			}
		}
		
		int perpage = 10;
		String page = request.getParameter(cfg.getProperty("request.page"));
		int start = 0;
		if(page != null) {
			try {
				int p = Integer.parseInt(page);
				if(p > 0) {
					start = perpage * (p-1);
					request.setAttribute(cfg.getProperty("request.page"), page);
				}
			} catch(Exception e) {
				start = 0;
			}
		}
		
		StringBuilder s = new StringBuilder();
		s.append("SELECT * FROM {Music}");
		s.append(" ");
		if("hottest".equals(searchType)) {
			s.append(" ORDER BY {Music.rate} DESC ,{Music.id} DESC LIMIT ");
			s.append(start);
			s.append(" , ");
			s.append(perpage);
		} else if("name".equals(searchType)) {
			s.append(" WHERE {Music.name} LIKE '%");
			s.append(searchKey);
			s.append("%'");
			s.append(" LIMIT ");
			s.append(start);
			s.append(", ");
			s.append(perpage);
		} else if("author".equals(searchType)) {
			s.append(" WHERE {Music.author} LIKE '%");
			s.append(searchKey);
			s.append("%'");
			s.append(" LIMIT ");
			s.append(start);
			s.append(", ");
			s.append(perpage);
		} else if("singer".equals(searchType)) {
			s.append(" WHERE {Music.singer} LIKE '%");
			s.append(searchKey);
			s.append("%'");
			s.append(" LIMIT 0, 10");
		} else if("type".equals(searchType)) {
			s.append(" WHERE {Music.type} LIKE '%");
			s.append(searchKey);
			s.append("%'");
			s.append(" LIMIT ");
			s.append(start);
			s.append(", ");
			s.append(perpage);
		} else if("recommended".equalsIgnoreCase(searchType)) {
			if(!Auth.isLogin(request)) {
				return "forward.jsp";
			}
			s.append(" INNER JOIN {Predict} ON {Music.id} = {Predict.musicId} ");
			s.append(" WHERE {Predict.userId} = ");
			s.append(Auth.user(request));
			s.append(" ORDER BY {Predict.rate} DESC, {Music.id} DESC ");
			s.append(" LIMIT ");
			s.append(start);
			s.append(" , ");
			s.append(perpage);
		} else {
			s.append(" ORDER BY {Music.id} DESC LIMIT ");
			s.append(start);
			s.append(" , ");
			s.append(perpage);
		}
		String query = s.toString();
		query = QueryUtil.processQuery(query, Music.class, Predict.class);
		log.info("Search: " + query);
		Persistence persistence = Persistences.getPersistence(SystemLoader.systemConfig());
		Iterator<Music> musics = persistence.list(Music.class, query);
		request.setAttribute(cfg.getProperty("music.list"), musics);
		return "music_list.jsp";
	}
	
}
