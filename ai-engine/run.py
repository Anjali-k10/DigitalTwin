"""
LifeTwin AI Engine - Entry Point
================================
Starts the Flask microservice for the LifeTwin AI prediction engine.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app import create_app


def print_startup_banner(port, env):
    """Print a branded startup banner similar to the Node.js server."""
    banner = f"""
+==============================================================+
|                                                              |
|              LifeTwin AI Engine                               |
|              -----------------------                         |
|                                                              |
|   Status:       Online                                       |
|   Environment:  {env:<12s}                                   |
|   Port:         {port:<12s}                                   |
|   Version:      1.0.0                                        |
|                                                              |
+==============================================================+
|                                                              |
|   Available Endpoints:                                       |
|   ---------------------------------------------              |
|   GET    /api/health              Health check & status      |
|   POST   /api/predict/burnout     Burnout risk prediction    |
|   POST   /api/predict/productivity  Productivity scoring     |
|   POST   /api/analyze/correlation   Behavioral correlation   |
|                                                              |
+==============================================================+
|   Server listening on http://0.0.0.0:{port:<5s}                   |
+==============================================================+
"""
    print(banner)


# if __name__ == "__main__":
#     flask_env = os.getenv("FLASK_ENV", "development")
#     flask_port = int(os.getenv("FLASK_PORT", 5050))
#     flask_debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

#     app = create_app(flask_env)

#     print_startup_banner(str(flask_port), flask_env)

#     app.run(
#         host="0.0.0.0",
#         port=flask_port,
#         debug=flask_debug,
#     )
flask_env = os.getenv("FLASK_ENV", "production")

app = create_app(flask_env)

if __name__ == "__main__":

    flask_port = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5050)))

    flask_debug = (
        os.getenv("FLASK_DEBUG", "False").lower()
        in ("true", "1", "yes")
    )

    print_startup_banner(str(flask_port), flask_env)

    app.run(
        host="0.0.0.0",
        port=flask_port,
        debug=flask_debug,
    )