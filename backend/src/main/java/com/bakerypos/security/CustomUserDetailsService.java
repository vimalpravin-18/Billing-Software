package com.bakerypos.security;

import com.bakerypos.entity.User;
import com.bakerypos.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ConcurrentMap<String, CachedUserDetails> userCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    private static class CachedUserDetails {
        final UserDetails userDetails;
        final long cachedAt;

        CachedUserDetails(UserDetails userDetails) {
            this.userDetails = userDetails;
            this.cachedAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - cachedAt > CACHE_TTL_MS;
        }
    }

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CachedUserDetails cached = userCache.get(username);
        if (cached != null && !cached.isExpired()) {
            return cached.userDetails;
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        userCache.put(username, new CachedUserDetails(userDetails));
        return userDetails;
    }

    public void evictUser(String username) {
        if (username != null) {
            userCache.remove(username);
        }
    }

    public void clearCache() {
        userCache.clear();
    }
}
