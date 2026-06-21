#!/bin/bash
set -e

echo "=== Step 1: Install prerequisites ==="
apt-get install -y apt-transport-https lsb-release ca-certificates curl gnupg2

echo "=== Step 2: Download and add the Sury GPG key ==="
curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg https://packages.sury.org/php/apt.gpg

echo "=== Step 3: Add Sury PHP repo using 'bullseye' ==="
echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ bullseye main" \
  > /etc/apt/sources.list.d/php-sury.list

echo "=== Step 4: Update package lists ==="
apt-get update

# List of extensions that are safe on Ubuntu 20.04 (no libicu67 or libssl1.1-only deps)
# intl is EXCLUDED because it requires libicu67 (only available in Debian Bullseye, not Ubuntu 20.04)
PHP81_PKGS="php8.1 php8.1-cli php8.1-common php8.1-mysql php8.1-pgsql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-sqlite3 php8.1-fpm php8.1-opcache"
PHP82_PKGS="php8.2 php8.2-cli php8.2-common php8.2-mysql php8.2-pgsql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-sqlite3 php8.2-fpm php8.2-opcache"

echo "=== Step 5: Install PHP 8.1 ==="
if php8.1 -v &>/dev/null; then
  echo "PHP 8.1 is already installed — skipping."
else
  apt-get install -y $PHP81_PKGS
fi

echo "=== Step 6: Install PHP 8.2 ==="
if php8.2 -v &>/dev/null; then
  echo "PHP 8.2 is already installed — skipping."
else
  apt-get install -y $PHP82_PKGS
fi

echo "=== Step 7: Register all PHP versions with update-alternatives ==="
[ -f /usr/bin/php7.4 ] && update-alternatives --install /usr/bin/php php /usr/bin/php7.4 74
[ -f /usr/bin/php8.0 ] && update-alternatives --install /usr/bin/php php /usr/bin/php8.0 80
[ -f /usr/bin/php8.1 ] && update-alternatives --install /usr/bin/php php /usr/bin/php8.1 81
[ -f /usr/bin/php8.2 ] && update-alternatives --install /usr/bin/php php /usr/bin/php8.2 82

echo "=== Step 8: Set PHP 8.2 as the default CLI ==="
update-alternatives --set php /usr/bin/php8.2

echo ""
echo "======================================"
echo "All installed PHP versions:"
ls /usr/bin/php[0-9]* 2>/dev/null
echo ""
echo "Active version:"
php -v
