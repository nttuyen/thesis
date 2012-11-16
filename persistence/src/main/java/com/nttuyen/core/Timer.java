/**
 * 
 */
package com.nttuyen.core;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Timer
 * @author nttuyen
 * @version: 1.0
 * @since 29.01.2010
 */
public class Timer {
	private long startTime = 0;
	private long stopTime = 0;
	private boolean stoped = false;
	
	private static final Map<String, Timer> map = new HashMap<String, Timer>();
	private static final Map<String, Long> time = new HashMap<String, Long>();
	private static final long MAX_TIME = 3600000L;
	
	private Timer() {
		this.stoped = true;
	}
	
	/**
	 * Get Timmer by Name
	 * @param name
	 * @return timer
	 */
	public static Timer getTimer(String name) {
		if(map.containsKey(name) && map.get(name) != null) {
			time.put(name, System.currentTimeMillis());
			return map.get(name);
		}
		Timer timer = new Timer();
		map.put(name, timer);
		time.put(name, System.currentTimeMillis());
		new Thread(new Runnable() {
			
			public void run() {
				Set<String> keys = time.keySet();
				long current = System.currentTimeMillis();
				for(String key : keys) {
					if(current - time.get(key) < MAX_TIME) {
						map.remove(key);
						time.remove(key);
					}
				}
			}
		}).start();
		return timer;
	}
	
	/**
	 * Get Default Timer of currentThread
	 * @return timmer of current thread
	 */
	private static Timer getTimer() {
		return getTimer(Thread.currentThread().getName());
	}
	
	/**
	 * Init Timer of current thread
	 */
	public static void init() {
		Timer.getTimer().start();
	}
	
	public static void destroy(String name) {
		time.remove(name);
		map.remove(name);
	}
	
	public static void destroy() {
		destroy(Thread.currentThread().getName());
	}
	
	/**
	 * Get time execution of current thread
	 * @return
	 */
	public static long time() {
		return Timer.getTimer().duration();
	}
	
	/**
	 * Start Timer
	 */
	public void start(){
		this.startTime = System.currentTimeMillis();
		this.stoped = false;
	}
	
	/**
	 * Stop Timer
	 */
	public void end(){
		this.stopTime = System.currentTimeMillis();
		this.stoped = true;
	}
	
	/**
	 * Get duration of execution
	 * @return
	 */
	public long duration(){
		if(stoped) {
			if(startTime == 0) {
				throw new UnsupportedOperationException("This Timer is not started");
			}
			return stopTime - startTime;
		}
		return System.currentTimeMillis() - startTime;
	}
}
