/**
 * 
 */
package com.nttuyen.recommendation;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import org.apache.log4j.Logger;
import com.nttuyen.dao.query.QueryUtil;
import com.nttuyen.dao.jdbc.Connector;
import com.nttuyen.dao.jdbc.ConnectorFactory;
import com.nttuyen.thesis.model.Music;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class RecommenderServices {
	
	private static final Logger log = Logger.getLogger(RecommenderServices.class);
	private static final Properties cfg = SystemLoader.systemConfig();
    private static final Connector connector = ConnectorFactory.createConnector(cfg);
	
	private int maxUserID = 0;
	private int maxMusicID = 0;
	
	private byte[][] rate = null;
	//private float[][] predict = null;
	private float[][] usimilarity = null;
	private float[][] ucontent = null;
	private float[][] isimilarity = null;
	private float[][] icontent = null;
	
	private final float ALPHA = 0.01f;
	private final float BETA = 0.3f;
	
	private final int MAX_LOOP = 30;
	
	private Thread uthread = null;
	private Thread ithread = null;
	
	private boolean running = false;
	
	private RecommenderServices() {
		running = true;
		System.out.println("Start calculate!");
		
		String sql = "SELECT max({user.id}) FROM {user.table}";
		sql = QueryUtil.processQuery(sql, cfg);
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			ResultSet rs = stm.executeQuery();
			if(rs.next()) {
				maxUserID = (int)rs.getLong(1);
			}
			rs.close();
			stm.close();
			
			
			sql = "SELECT max({music.id}) FROM {music.table}";
			sql = QueryUtil.processQuery(sql, cfg);
			stm = connection.prepareStatement(sql);
			rs = stm.executeQuery();
			if(rs.next()) {
				maxMusicID = (int)rs.getLong(1);
			}
			rs.close();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
		}
		if(maxUserID > 0 && maxMusicID > 0) {
			rate = new byte[maxUserID+1][maxMusicID+1];
			//predict = new float[maxUserID+1][maxMusicID+1];
			usimilarity = new float[maxUserID+1][maxUserID+1];
			ucontent = new float[maxUserID+1][maxUserID+1];
			isimilarity = new float[maxMusicID+1][maxMusicID+1];
			icontent = new float[maxMusicID+1][maxMusicID+1];
			
			for(int i = 0; i <= maxUserID; i++) {
				ucontent[i][i] = 1;
				usimilarity[i][i] = 1;
				for(int j = i +1; j <= maxUserID; j ++) {
					ucontent[i][j] = 0;
					ucontent[j][i] = 0;
					usimilarity[i][j] = 0;
					usimilarity[j][i] = 0;
				}
			}
			
			sql = "SELECT {music.id}, {music.name}, {music.author}, {music.singer}, {music.album} FROM {music.table}";
			sql = QueryUtil.processQuery(sql, cfg);
			Music musics[] = new Music[maxMusicID+1];
			try {
				Connection connection = connector.getConnection();
				PreparedStatement stm = connection.prepareStatement(sql);
				ResultSet rs = stm.executeQuery();
				while(rs.next()) {
					int id = (int)rs.getLong(cfg.getProperty("music.id"));
					musics[id] = new Music();
					musics[id].setName(rs.getString(cfg.getProperty("music.name")));
					musics[id].setAuthor(rs.getString(cfg.getProperty("music.author")));
					musics[id].setSinger(rs.getString(cfg.getProperty("music.singer")));
					musics[id].setAlbum(rs.getString(cfg.getProperty("music.album")));
				}
				rs.close();
				stm.close();
				
				sql = "SELECT {rating.userid}, {rating.itemid}, {rating.rate} FROM {rating.table}";
				sql = QueryUtil.processQuery(sql, cfg);
				stm = connection.prepareStatement(sql);
				
				rs = stm.executeQuery();
				while(rs.next()) {
					int userID = (int)rs.getLong(cfg.getProperty("rating.userid"));
					int musicID = (int)rs.getLong(cfg.getProperty("rating.itemid"));
					int r = (int)rs.getInt(cfg.getProperty("rating.rate"));
					rate[userID][musicID] = (byte)r;
				}
				
				connection.close();
			} catch (SQLException e) {
				log.error("SQL Exception", e);
			}
			for(int i = 1; i <= maxMusicID; i ++) {
				icontent[i][i] = 1;
				for(int j = i+1; j <= maxMusicID; j++) {
					float sim = 0;
					if(musics[i] != null && musics[j] != null) {
						if(!"".equals(musics[i].getName()) && musics[i].getName() != null && musics[i].getName().equalsIgnoreCase(musics[j].getName())) {
							sim += 0.25;
						}
						if(!"".equals(musics[i].getAuthor()) && musics[i].getAuthor() != null && musics[i].getAuthor().equalsIgnoreCase(musics[j].getAuthor())) {
							sim += 0.25;
						}
						if(!"".equals(musics[i].getSinger()) && musics[i].getSinger() != null && musics[i].getSinger().equalsIgnoreCase(musics[j].getSinger())) {
							sim += 0.25;
						}
						if(!"".equals(musics[i].getAlbum()) && musics[i].getAlbum() != null && musics[i].getAlbum().equalsIgnoreCase(musics[j].getAlbum())) {
							sim += 0.25;
						}
					}
					icontent[i][j] = sim;
					icontent[j][i] = sim;
				}
			}
			
			
			uthread = new Thread(new Runnable() {
				private float total = 0;
				boolean run = true;
				@Override
				public void run() {
					float total1 = 0;
					float sim = 0;
					float m = 0;
					int loop = 0;
					while(run) {
						log.info("User-Loop: " + (++loop));
						log.info("User-Total: " + total);
						total1 = 0;
						for(int i = 1; i <= maxUserID; i++) {
							for(int j = i + 1; j <= maxUserID; j++) {
								sim = 0;
								m = 0;
								for(int x = 1; x <= maxMusicID; x++) {
									for(int y = 1; y <= maxMusicID; y++) {
										if(rate[i][x] != 0 && rate[j][y] != 0) {
											sim += isimilarity[x][y] * Math.exp(0 - Math.pow((rate[i][x] - rate[j][y]), 2)/3);
											m++;
										}
									}
								}
								if(m == 0) {
									m = 1;
								}
								sim = sim * (1-ALPHA) / m;
								//log.info("u[][]: " + sim);
								total1 += sim;
								usimilarity[i][j] = sim;
								usimilarity[j][i] = sim;
							}
						}
						if(Math.abs(total1 - total) < 0.01 || loop > MAX_LOOP) {
							run = false;
						} else {
							total = total1;
						}
					}
				}
			});
			
			ithread = new Thread(new Runnable() {
				private float total = 0;
				boolean run = true;
				@Override
				public void run() {
					float total1 = 0;
					float sim = 0;
					float m = 0;
					int loop = 0;
					while(run) {
						log.info("Item-Loop: " + (++loop));
						log.info("Item-Total: " + total);
						total1 = 0;
						for(int x = 1; x <= maxMusicID; x++) {
							for(int y = x+1; y <= maxMusicID; y++) {
								sim = 0;
								m = 0;
								for(int i = 1; i <= maxUserID; i++) {
									for(int j = 1; j <= maxUserID; j++) {
										if(rate[i][x] != 0 && rate[j][y] != 0) {
											sim += usimilarity[i][j] * Math.exp(0 - Math.pow((rate[i][x] - rate[j][y]), 2)/3);
											m++;
										}
									}
								}
								if(m == 0) {
									m = 1;
								}
								//log.info("i[][]=" + sim);
								//log.info("m = " + m);
								sim = (sim * (1-BETA) / m) + icontent[x][y] * BETA;
								total1 += sim;
								//log.info("h[][]=" + sim);
								isimilarity[x][y] = sim;
								isimilarity[y][x] = sim;
							}
						}
						if(Math.abs(total1 - total) < 0.01 || loop > MAX_LOOP) {
							run = false;
						} else {
							//log.info("Total1: " + total1);
							total = total1;
						}
					}
				}
			});
			
			uthread.run();
			ithread.run();
			running = false;
		}
	}
	
	public boolean isRunning() {
		if(uthread.isAlive() || ithread.isAlive()) {
			return true;
		}
		return running;
	}
	
	public void active() {
		for(int i = 1; i <= maxUserID; i++) {
			for(int y = 1; y <= maxMusicID; y++) {
				if(rate[i][y] == 0) {
					float predict = 0;
					float m = 0;
					for(int x = 1; x <= maxMusicID; x++){
						if(rate[i][x] != 0) {
							predict += isimilarity[x][y]*rate[i][x];
							m += isimilarity[x][y];
						}
					}
					if(m == 0) {
						m = 1;
					}
					predict = predict/m;
					//log.info("rate[" + i + "][" + y + "] = " + predict);
					log.error("predict_rate[" + i + "][" + y + "] = " + predict);
					if(predict >= 3 & predict <=5) {
						try {
							Connection connection = connector.getConnection();
							String sql = "INSERT INTO {predict.table}({predict.userid}, {predict.itemid}, {predict.rate}) VALUES (?,?,?)  ON DUPLICATE KEY UPDATE {predict.rate} = ?";
							sql = QueryUtil.processQuery(sql, cfg);
							PreparedStatement stm = connection.prepareStatement(sql);
							stm.setLong(1, i);
							stm.setLong(2, y);
							stm.setFloat(3, predict);
							stm.setFloat(4, predict);
							stm.executeUpdate();
							stm.close();
							connection.close();
						} catch (SQLException e) {
							log.error("SQL Exception", e);
						}
					}
				} else {
					try {
						Connection connection = connector.getConnection();
						String sql = "DELETE FROM {predict.table} WHERE {predict.userid} = ? AND {predict.itemid} = ?";
						sql = QueryUtil.processQuery(sql, cfg);
						PreparedStatement stm = connection.prepareStatement(sql);
						stm.setLong(1, i);
						stm.setLong(2, y);
						stm.executeUpdate();
						stm.close();
						connection.close();
					} catch (SQLException e) {
						log.error("SQL Exception", e);
					}
				}
			}
		}
	}
	
	public static void main(String[] args) {
		new Thread(new Runnable() {
			RecommenderServices services = null;
			@Override
			public void run() {
				services = new RecommenderServices();
				while(true) {
					try {
						System.out.println("Calculate similarity completed!");
						Thread.sleep(15000);
						if(!services.isRunning()) {
							services.active();
							services = new RecommenderServices();
						}
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
			}
		}).start();
	}
}
