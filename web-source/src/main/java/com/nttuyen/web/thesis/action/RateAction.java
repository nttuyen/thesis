/**
 * 
 */
package com.nttuyen.web.thesis.action;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import com.nttuyen.dao.query.QueryUtil;
import com.nttuyen.dao.jdbc.Connector;
import com.nttuyen.dao.jdbc.ConnectorFactory;
import com.nttuyen.thesis.util.Auth;
import com.nttuyen.web.core.Action;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class RateAction implements Action{
	
	private static final Logger log = Logger.getLogger(RateAction.class);

	
	public String execute(HttpServletRequest request,
			HttpServletResponse response, String... param) {
		Properties cfg = SystemLoader.systemConfig();
		if(!Auth.isLogin(request)) {
			log.info("user not logged in");
			return "forward.jsp";
		}
		if(param.length < 1) {
			log.info("music id not found");
			return "forward.jsp";
		}
		long musicID = 0;
		int rate;
		try {
			musicID = Long.parseLong(param[0]);
			String r = request.getParameter("rating");
			float ratef = Float.parseFloat(r);
			rate = Math.round(ratef);
			if(rate < 1 || rate > 5) {
				rate = 1;
			}
		} catch(Exception e) {
			log.error("rate not found");
			return "forward.jsp";
		}
		long userID = Auth.user(request);
		String sql = "INSERT INTO {rating.table}({rating.userid}, {rating.itemid}, {rating.rate}, {rating.time}) VALUES (?,?,?,?)  ON DUPLICATE KEY UPDATE {rating.rate} = ?";
		sql = QueryUtil.processQuery(sql, cfg);
		Connector connector = ConnectorFactory.createConnector(cfg);
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.setLong(1, userID);
			stm.setLong(2, musicID);
			stm.setInt(3, rate);
			stm.setLong(4, System.currentTimeMillis());
			stm.setInt(5, rate);
			//stm.setLong(5, userID);
			//stm.setLong(6, musicID);
			log.info("Query: " + stm.toString());
			stm.executeUpdate();
			stm.close();
			
			//Update AVG(rate)
			sql = "UPDATE {music.table} SET {music.rate} = (SELECT AVG({rating.rate}) FROM {rating.table} WHERE {rating.itemid} = ?) WHERE {music.id} = ?";
			sql = QueryUtil.processQuery(sql, cfg);
			stm = connection.prepareStatement(sql);
			stm.setLong(1, musicID);
			stm.setLong(2, musicID);
			log.info("Query: " + stm.toString());
			stm.executeUpdate();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
		}
		return "forward.jsp";
	}

}
